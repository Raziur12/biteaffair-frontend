// WhatsApp Business API Service
import { CONTACT_INFO } from '../utils/constants';

class WhatsAppService {
  constructor() {
    this.baseURL = 'https://api.whatsapp.com/send'; // WhatsApp Web URL
    // For production, you would use WhatsApp Business API
    // this.businessAPI = 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages';
  }

  getAdminWhatsAppNumber() {
    const raw = CONTACT_INFO?.WHATSAPP;
    if (!raw) return '';

    // Accept either a wa.me URL (https://wa.me/919...) or a raw number string (919...)
    if (typeof raw === 'string') {
      const digits = raw.replace(/\D/g, '');
      return digits;
    }

    return '';
  }

  normalizeIndianPhoneNumber(phoneNumber) {
    const digits = String(phoneNumber || '').replace(/\D/g, '');
    if (!digits) return '';

    // If user entered a 10-digit Indian mobile, prepend country code
    if (digits.length === 10) return `91${digits}`;

    // If user entered with country code already
    if (digits.length === 12 && digits.startsWith('91')) return digits;

    // If user entered 0-prefixed local number (e.g. 09876543210)
    if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;

    // Fallback: return raw digits (best effort)
    return digits;
  }

  formatIndianDisplayPhone(phoneNumber) {
    const normalized = this.normalizeIndianPhoneNumber(phoneNumber);
    if (!normalized) return '';
    const last10 = normalized.slice(-10);
    return `+91-${last10}`;
  }

  // Format order details for WhatsApp message
  formatOrderDetails(orderData) {
    const {
      items,
      totalPrice,
      subTotal,
      deliveryCharge,
      packagingCharge,
      gstAmount,
      deliveryDate,
      deliveryTime,
      location,
      phoneNumber
    } = orderData;

    const safeItems = Array.isArray(items) ? items : [];
    const displayPhone = this.formatIndianDisplayPhone(phoneNumber) || String(phoneNumber || '');
    const displayLocation = String(location || '');
    const displayDate = String(deliveryDate || '');
    const displayTime = String(deliveryTime || '');

    const padRight = (value, width) => {
      const str = String(value ?? '');
      return str.length >= width ? str : str + ' '.repeat(width - str.length);
    };

    const money = (value) => {
      const n = Number(value);
      if (!Number.isFinite(n)) return '0';
      return Math.round(n).toString();
    };

    const hasBreakdown = [subTotal, deliveryCharge, packagingCharge, gstAmount].some((v) => {
      const n = Number(v);
      return Number.isFinite(n);
    });

    const headerLeft1 = `� Phone: ${displayPhone}`;
    const headerRight1 = `�📍 Location: ${displayLocation}`;
    const headerLeft2 = `📅 Delivery Date: ${displayDate}`;
    const headerRight2 = `⏰ Delivery Time: ${displayTime}`;
    const colWidth = Math.max(
      headerLeft1.length,
      headerLeft2.length,
      24
    );
    const headerGrid = [
      `${padRight(headerLeft1, colWidth)}  ${headerRight1}`,
      `${padRight(headerLeft2, colWidth)}  ${headerRight2}`
    ].join('\n');

    const normalizedRows = safeItems.map((item, idx) => {
      const name = String(item.name || item.title || `Item ${idx + 1}`);
      const qty = Number(item.quantity) || 0;
      const unitPrice = Number(item.price ?? item.calculatedPrice ?? item.basePrice ?? 0) || 0;
      const amount = unitPrice * qty;
      
      // Get selected package items if available
      const selectedItems = item.customizations?.selectedItems;
      let selectedDetails = '';
      if (selectedItems && typeof selectedItems === 'object') {
        const categoryLabels = {
          starters: 'Starters',
          maincourse: 'Main',
          rice: 'Rice',
          breads: 'Breads',
          desserts: 'Dessert'
        };
        const details = Object.entries(selectedItems)
          .filter(([_, items]) => items && items.length > 0)
          .map(([category, items]) => {
            const label = categoryLabels[category] || category;
            return `${label}: ${items.join(', ')}`;
          });
        if (details.length > 0) {
          selectedDetails = details.join(' | ');
        }
      }
      
      return {
        name,
        qty: qty ? String(qty) : '0',
        amount: money(amount),
        selectedDetails
      };
    });

    const maxName = Math.min(
      24,
      Math.max(4, ...normalizedRows.map((r) => r.name.length))
    );
    const maxQty = Math.max(3, ...normalizedRows.map((r) => r.qty.length));
    const maxAmt = Math.max(6, ...normalizedRows.map((r) => r.amount.length) + 1);

    const itemHeader = `${padRight('Item', maxName)}  ${padRight('Qty', maxQty)}  Amount`;
    const itemSep = `${'-'.repeat(maxName)}  ${'-'.repeat(maxQty)}  ${'-'.repeat(Math.max(6, 'Amount'.length))}`;
    const itemLines = normalizedRows
      .map((r) => {
        const itemName = r.name.length > maxName ? `${r.name.slice(0, Math.max(0, maxName - 1))}…` : r.name;
        let line = `${padRight(itemName, maxName)}  ${padRight(r.qty, maxQty)}  ₹${r.amount}`;
        // Add selected items details on next line if present
        if (r.selectedDetails) {
          line += `\n  └─ ${r.selectedDetails}`;
        }
        return line;
      })
      .join('\n');

    let message = `🍽️ *BiteAffair Order Confirmation*\n\n`;
    message += `\`\`\`\n${headerGrid}\n\`\`\`\n\n`;
    message += `🛒 *Order Items:*\n`;
    message += `\`\`\`\n${itemHeader}\n${itemSep}\n${itemLines || ''}\n\`\`\`\n\n`;

    if (hasBreakdown) {
      message += `🧾 *Bill Summary:*\n`;
      message += `\`\`\`\n`;
      message += `Sub Total         ₹${money(subTotal)}\n`;
      message += `Delivery Charges  ₹${money(deliveryCharge)}\n`;
      message += `Packaging Charges ₹${money(packagingCharge)}\n`;
      message += `GST (Incl. CGST)  ₹${money(gstAmount)}\n`;
      message += `\`\`\`\n\n`;
    }

    message += `💰 *Total Amount:* ₹${money(totalPrice)}\n\n`;
    message += `✅ Your order has been confirmed!\n`;
    message += `📞 We'll contact you soon for further details.\n\n`;
    message += `Thank you for choosing BiteAffair! 🙏`;

    return message;
  }

  // Send order details via WhatsApp Web (opens WhatsApp)
  async sendOrderDetails(phoneNumber, orderData) {
    try {
      const message = this.formatOrderDetails(orderData);
      const encodedMessage = encodeURIComponent(message);
      
      // Message should be sent to admin/business WhatsApp (customer's phone stays in message body)
      const adminPhone = this.getAdminWhatsAppNumber();
      const destinationPhone = adminPhone || phoneNumber;

      // WhatsApp expects countrycode+number digits only (no '+')
      const formattedPhone = this.normalizeIndianPhoneNumber(destinationPhone);
      
      const whatsappURL = `${this.baseURL}?phone=${formattedPhone}&text=${encodedMessage}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappURL, '_blank');
      
      return {
        success: true,
        message: 'Order details sent to WhatsApp',
        whatsappURL
      };
      
    } catch (error) {
      console.error('WhatsApp Service Error:', error);
      return {
        success: false,
        message: 'Failed to send WhatsApp message',
        error: error.message
      };
    }
  }

  // Send via WhatsApp Business API (for production)
  async sendViaBusinessAPI(phoneNumber, orderData) {
    try {
      // This would be used with actual WhatsApp Business API
      const message = this.formatOrderDetails(orderData);
      
      const payload = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: {
          body: message
        }
      };
      
      // In production, you would make API call here
      // const response = await fetch(this.businessAPI, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${ACCESS_TOKEN}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(payload)
      // });
      
      console.log('Would send via Business API:', payload);
      
      return {
        success: true,
        message: 'Order details sent via WhatsApp Business API'
      };
      
    } catch (error) {
      console.error('WhatsApp Business API Error:', error);
      return {
        success: false,
        message: 'Failed to send via WhatsApp Business API',
        error: error.message
      };
    }
  }

  // Send OTP via WhatsApp (alternative to SMS)
  async sendOTPViaWhatsApp(phoneNumber, otpCode) {
    try {
      const message = `🔐 *BiteAffair Verification Code*\n\nYour OTP is: *${otpCode}*\n\nPlease enter this code to verify your order.\n\n⚠️ Do not share this code with anyone.`;
      const encodedMessage = encodeURIComponent(message);
      
      const formattedPhone = this.normalizeIndianPhoneNumber(phoneNumber);
      const whatsappURL = `${this.baseURL}?phone=${formattedPhone}&text=${encodedMessage}`;
      
      window.open(whatsappURL, '_blank');
      
      return {
        success: true,
        message: 'OTP sent via WhatsApp',
        otpCode
      };
      
    } catch (error) {
      console.error('WhatsApp OTP Error:', error);
      return {
        success: false,
        message: 'Failed to send OTP via WhatsApp',
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();
export default whatsappService;
