import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useCart } from '../../context/CartContext';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Checkbox,
  FormControlLabel,
  Alert
} from '@mui/material';
import {
  Close,
  Add,
  Remove
} from '@mui/icons-material';

// Hoisted static constants
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';

const DIALOG_PAPER_SX = {
  borderRadius: { xs: '16px 16px 0 0', sm: 2 },
  maxWidth: { xs: '100%', sm: '550px' },
  width: { xs: '100%', sm: '550px' },
  m: { xs: 0, sm: 'auto' },
  position: { xs: 'fixed', sm: 'relative' },
  bottom: { xs: 0, sm: 'auto' },
  left: { xs: 0, sm: 'auto' },
  right: { xs: 0, sm: 'auto' },
  maxHeight: { xs: '85vh', sm: '90vh' },
  overflow: 'hidden'
};

const ItemCustomizationModal = ({ 
  open, 
  onClose, 
  item, 
  onAddToCart,
  guestCount 
}) => {
  const [serves, setServes] = useState(10);
  const [quantity, setQuantity] = useState('XX pcs');
  const [selectedItems, setSelectedItems] = useState({});
  const [alertMessage, setAlertMessage] = useState('');

  const isPackageMenuItem = Boolean(item?.packageKey || item?.packageIncludes);

  const getPackageIncludedCount = (pkgItem) => {
    const includes = pkgItem?.packageIncludes;
    if (!includes || typeof includes !== 'object') return 0;
    return Object.values(includes)
      .filter((v) => typeof v === 'number' && Number.isFinite(v))
      .reduce((sum, v) => sum + v, 0);
  };

  const scalePackageItemQuantity = (qty, unit, basePax, pax) => {
    const q = Number(qty);
    if (!Number.isFinite(q) || !q) return '';
    const scaled = basePax > 0 ? (q / basePax) * pax : q;
    if (String(unit).toLowerCase() === 'kg') return `${Number(scaled.toFixed(1))}kg`;
    return `${Math.round(scaled)}pc`;
  };

  // Helper function to get service count based on item type
  const getServiceCountForItem = (item) => {
    if (!item) return guestCount?.veg || 10;
    
    // Check if item is non-veg first (priority check)
    if (item.isNonVeg) {
      return guestCount?.nonVeg || 10;
    }
    // Check if item is jain
    else if (item.isJain) {
      return guestCount?.jain || 1;
    }
    // Default to veg (includes pure veg items and items without clear classification)
    else {
      return guestCount?.veg || 10;
    }
  };

  // Reset values when modal opens
  useEffect(() => {
    if (open && item) {
      if (isPackageMenuItem) {
        const pax = Math.max(1, parseInt(item.serves || item.quantity || 1) || 1);
        setServes(pax);
        setQuantity(item.portion_size || item.calculatedQuantity || `${pax} pax`);
        return;
      }
      // For Breads and Desserts, the `serves` is the total guest count
      if (item.category === 'breads' || item.category === 'desserts') {
        const totalGuests = (guestCount?.veg || 0) + (guestCount?.nonVeg || 0) + (guestCount?.jain || 0);
        setServes(item.serves || totalGuests);
      } else {
        // For other items, use the existing logic
        const serviceCount = getServiceCountForItem(item);
        setServes(serviceCount);
      }
      setQuantity(item.portion_size || item.calculatedQuantity || 'XX pcs');
    }
  }, [open, item, guestCount, isPackageMenuItem]);

  // Reset selected items when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedItems({});
      setAlertMessage('');
    }
  }, [open]);

  const handleAddToCart = useCallback(() => {
    if (!item) return;

    if (isPackageMenuItem) {
      const pax = Math.max(1, parseInt(serves) || 1);
      const perGuestPrice = parseFloat(item?.price || item?.calculatedPrice || item?.basePrice) || 0;

      // Filter only selected items
      const selectedPackageItems = {};
      Object.keys(selectedItems).forEach(category => {
        const selectedInCategory = Object.entries(selectedItems[category] || {})
          .filter(([_, isSelected]) => isSelected)
          .map(([name]) => name);
        if (selectedInCategory.length > 0) {
          selectedPackageItems[category] = selectedInCategory;
        }
      });

      // Validate minimum selections
      const includes = item?.packageIncludes || {};
      const requiredStarters = includes?.starters || 3;
      const requiredMain = includes?.mainCourse || 3;
      const requiredRice = includes?.rice || 1;
      const requiredBreads = includes?.breads || 2;
      const requiredDessert = includes?.dessert || 1;

      const selectedStarters = selectedPackageItems['starters']?.length || 0;
      const selectedMain = selectedPackageItems['maincourse']?.length || 0;
      const selectedRice = selectedPackageItems['rice']?.length || 0;
      const selectedBreads = selectedPackageItems['breads']?.length || 0;
      const selectedDessert = selectedPackageItems['desserts']?.length || 0;

      if (selectedStarters < requiredStarters || selectedMain < requiredMain || 
          selectedRice < requiredRice || selectedBreads < requiredBreads || 
          selectedDessert < requiredDessert) {
        setAlertMessage(`Please select: ${requiredStarters} starters, ${requiredMain} main course, ${requiredRice} rice, ${requiredBreads} breads, ${requiredDessert} dessert`);
        setTimeout(() => setAlertMessage(''), 5000);
        return;
      }

      const customizedItem = {
        ...item,
        quantity: pax,
        serves: pax,
        calculatedPrice: perGuestPrice,
        calculatedQuantity: `${pax} pax`,
        customizations: {
          serves: pax,
          quantity: `${pax} pax`,
          selectedItems: selectedPackageItems
        }
      };

      onAddToCart(customizedItem);
      onClose();
      return;
    }
    
    // Determine serves/guest count for this item
    const effectiveServes = item.serves || serves || getServiceCountForItem(item);

    // Derive a per-guest/unit price so CartContext can do: unitPrice * quantity
    const totalForGuests = item.calculatedPrice || item.price || item.basePrice || 0;
    const unitPrice = effectiveServes > 0 ? Math.ceil(totalForGuests / effectiveServes) : totalForGuests;

    const customizedItem = {
      ...item,
      id: `${item.id}_${Date.now()}`,
      // Quantity reflects guest/serves count
      quantity: effectiveServes,
      serves: effectiveServes,
      calculatedQuantity: item.calculatedQuantity || item.portion_size || quantity, // Use calculated quantity from services
      // Ensure per-unit pricing so CartContext total is correct
      price: unitPrice,
      calculatedPrice: unitPrice,
      customizations: {
        serves: effectiveServes,
        quantity: item.calculatedQuantity || item.portion_size || quantity
      }
    };
    
    onAddToCart(customizedItem);
    onClose();
  }, [item, serves, quantity, onAddToCart, onClose, isPackageMenuItem, selectedItems]);

  const packageDetails = useMemo(() => {
    if (!isPackageMenuItem) return null;
    const pkgItems = item?.packageItems;
    if (!pkgItems || typeof pkgItems !== 'object') return null;

    const basePax = Math.max(1, parseInt(item?.packagePax || 20) || 20);
    const pax = Math.max(1, parseInt(serves || 1) || 1);

    const order = ['starters', 'mainCourse', 'rice', 'breads', 'desserts', 'dessert'];
    const normalizeTitle = (key) => {
      if (key === 'mainCourse') return 'Main Course';
      if (key === 'rice') return 'Rice';
      if (key === 'breads') return 'Breads';
      if (key === 'desserts' || key === 'dessert') return 'Desserts';
      if (key === 'starters') return 'Starters';
      return String(key || '');
    };

    const grouped = order
      .filter((k) => Array.isArray(pkgItems?.[k]) && pkgItems[k].length)
      .map((k) => {
        const rows = pkgItems[k]
          .filter(Boolean)
          .map((entry) => {
            const name = entry?.name;
            if (!name) return null;
            const unit = entry?.unit || '';
            const qtyText = scalePackageItemQuantity(entry?.quantity, unit, basePax, pax);
            const extra = entry?.extra;
            const extraText = extra
              ? ` + ${scalePackageItemQuantity(extra?.quantity, extra?.unit || 'pc', basePax, pax)}`
              : '';
            return { name, qtyText: `${qtyText}${extraText}` };
          })
          .filter(Boolean);

        return { title: normalizeTitle(k), rows };
      })
      .filter((g) => g.rows.length);

    return grouped;
  }, [isPackageMenuItem, item, serves]);

  // Get limits from packageIncludes
  const getCategoryLimit = (categoryKey) => {
    const includes = item?.packageIncludes || {};
    const key = categoryKey.toLowerCase().replace(' ', '');
    if (key === 'maincourse') return includes?.mainCourse || 3;
    if (key === 'desserts') return includes?.dessert || includes?.desserts || 1;
    if (key === 'starters') return includes?.starters || 3;
    if (key === 'rice') return includes?.rice || 1;
    if (key === 'breads') return includes?.breads || 2;
    return 1;
  };

  const getSelectedCountForCategory = (categoryTitle) => {
    const key = categoryTitle.toLowerCase().replace(' ', '');
    return Object.values(selectedItems[key] || {}).filter(Boolean).length;
  };

  const handleItemToggle = (categoryTitle, itemName) => {
    const key = categoryTitle.toLowerCase().replace(' ', '');
    const limit = getCategoryLimit(key);
    const currentCount = getSelectedCountForCategory(categoryTitle);
    const isCurrentlySelected = selectedItems[key]?.[itemName] || false;

    if (!isCurrentlySelected && currentCount >= limit) {
      setAlertMessage(`You can only select ${limit} ${categoryTitle.toLowerCase()}. Please deselect one to add another.`);
      setTimeout(() => setAlertMessage(''), 3000);
      return;
    }

    setSelectedItems(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [itemName]: !isCurrentlySelected
      }
    }));
    setAlertMessage('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: DIALOG_PAPER_SX
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: { xs: 'flex-end', sm: 'center' },
          justifyContent: { xs: 'center', sm: 'center' }
        }
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        {/* Close Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton onClick={onClose} sx={{ p: 0.5 }}>
            <Close />
          </IconButton>
        </Box>

        {alertMessage && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {alertMessage}
          </Alert>
        )}

        {isPackageMenuItem && packageDetails && (
          <Box sx={{ mb: 3, px: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5, fontSize: '1.05rem' }}>
              Select Items (max: Starters 3, Main 3, Rice 1, Breads 2, Dessert 1)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '350px', overflowY: 'auto', pr: 1 }}>
              {packageDetails.map((group) => {
                const selectedCount = getSelectedCountForCategory(group.title);
                const limit = getCategoryLimit(group.title);
                return (
                  <Box key={group.title} sx={{ pl: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: selectedCount >= limit ? '#4caf50' : 'inherit' }}>
                      {group.title} ({selectedCount}/{limit} selected)
                    </Typography>
                    {group.rows.map((r, idx) => (
                      <FormControlLabel
                        key={`${group.title}_${idx}`}
                        control={
                          <Checkbox
                            checked={selectedItems[group.title.toLowerCase().replace(' ', '')]?.[r.name] || false}
                            onChange={() => handleItemToggle(group.title, r.name)}
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            {r.name} - {r.qtyText}
                          </Typography>
                        }
                        sx={{ display: 'flex', mb: 0.5, ml: 0 }}
                      />
                    ))}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Item Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            component="img"
            src={item?.image || FALLBACK_IMG}
            alt={item?.name || 'Item'}
            sx={{
              width: 60,
              height: 60,
              borderRadius: 1.5,
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.src = FALLBACK_IMG;
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  border: '2px solid',
                  borderColor: item?.isVeg ? '#4caf50' : '#f44336',
                  borderRadius: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'white'
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    backgroundColor: item?.isVeg ? '#4caf50' : '#f44336',
                    borderRadius: '50%'
                  }}
                />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                {item?.name || item?.title || 'Package'}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              {item?.description || 'Delicious north Indian menu'}
            </Typography>
          </Box>
        </Box>

        {/* Customize Quantity */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, fontSize: '1.1rem' }}>
          Customize Quantity
        </Typography>

        {/* Serves and Quantity Controls */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          {/* Serves */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Serves
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0e0e0', borderRadius: 1, py: 1 }}>
              <IconButton
                size="small"
                onClick={() => setServes(Math.max(1, serves - 1))}
                disabled={isPackageMenuItem}
                sx={{ p: 0.5 }}
              >
                <Remove sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography variant="h6" sx={{ mx: 2, minWidth: 30, textAlign: 'center', fontWeight: 'bold' }}>
                {serves}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setServes(serves + 1)}
                disabled={isPackageMenuItem}
                sx={{ p: 0.5 }}
              >
                <Add sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Quantity */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Quantity
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0e0e0', borderRadius: 1, py: 1 }}>
              <IconButton
                size="small"
                onClick={() => {
                  const currentNum = parseInt(quantity.replace(/\D/g, '')) || 0;
                  const newNum = Math.max(1, currentNum - 1);
                  setQuantity(`${newNum} pcs`);
                }}
                disabled={isPackageMenuItem}
                sx={{ p: 0.5 }}
              >
                <Remove sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography variant="h6" sx={{ mx: 2, minWidth: 50, textAlign: 'center', fontWeight: 'bold' }}>
                {isPackageMenuItem ? serves : (parseInt(quantity.replace(/\D/g, '')) || 0)}
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  const currentNum = parseInt(quantity.replace(/\D/g, '')) || 0;
                  const newNum = currentNum + 1;
                  setQuantity(`${newNum} pcs`);
                }}
                disabled={isPackageMenuItem}
                sx={{ p: 0.5 }}
              >
                <Add sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Add Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleAddToCart}
          sx={{
            bgcolor: '#1a237e',
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: 1,
            '&:hover': {
              bgcolor: '#303f9f'
            }
          }}
        >
          Add | ₹{isPackageMenuItem
            ? (Math.round((Number(item?.price || item?.calculatedPrice || item?.basePrice || 0) || 0) * (Number(serves) || 1)))
            : (item?.calculatedPrice || item?.price || item?.basePrice || 'XXXX')
          }
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ItemCustomizationModal);
