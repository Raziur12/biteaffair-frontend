import React, { useCallback, useEffect, useState, memo } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button
} from '@mui/material';
import { CheckCircle, LocalShipping } from '@mui/icons-material';

// Hoisted static styles
const PAPER_SX = { borderRadius: 2, p: 2 };

const OrderSuccessModal = ({ open, onClose, onOkay }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!open) setIsAnimating(false);
  }, [open]);

  const handleClose = useCallback(() => onClose && onClose(), [onClose]);
  const handleOkay = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    window.setTimeout(() => {
      if (onOkay) onOkay();
      if (onClose) onClose();
    }, 900);
  }, [isAnimating, onClose, onOkay]);
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: PAPER_SX
      }}
    >
      <DialogContent sx={{ textAlign: 'center', p: 4 }}>
        {/* Success Icon */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: '#ff6b35',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}
          >
            <CheckCircle sx={{ fontSize: 40, color: 'white' }} />
          </Box>
        </Box>

        {/* Success Message */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Thank you for placing the order.
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
          All the details have been shared on your WhatsApp Number.
        </Typography>

        {/* Okay Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleOkay}
          disabled={isAnimating}
          sx={{
            bgcolor: '#1a237e',
            position: 'relative',
            overflow: 'hidden',
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#303f9f'
            },
            '@keyframes deliveryMove': {
              from: { transform: 'translate(-10%, -50%)' },
              to: { transform: 'translate(calc(100% - 46px), -50%)' }
            }
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: '#FFC107',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isAnimating ? 1 : 0,
              transform: 'translate(-10%, -50%)',
              animation: isAnimating ? 'deliveryMove 900ms linear forwards' : 'none'
            }}
          >
            <LocalShipping sx={{ fontSize: 20, color: '#1a237e' }} />
          </Box>
          Okay
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default memo(OrderSuccessModal);
