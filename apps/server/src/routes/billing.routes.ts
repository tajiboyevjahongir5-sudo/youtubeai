import { Router, Request, Response } from 'express';
import { paymentService } from '../services/payment.service';

const router = Router({ mergeParams: true });

/**
 * Get subscription status for the current workspace
 */
router.get('/status', (req: Request, res: Response) => {
  const workspaceId = (req as any).workspaceId || req.params.id || (req.query.workspaceId as string) || 'default';
  const status = paymentService.getSubscriptionStatus(workspaceId);
  const settings = paymentService.getSettings();

  res.json({
    success: true,
    workspaceId,
    subscription: status,
    cardInfo: {
      cardNumber: paymentService.getActiveCard().card.cardNumber,
      cardHolder: paymentService.getActiveCard().card.cardHolder,
      basePrice: settings.basePrice,
    },
  });
});

/**
 * Create a new payment invoice with unique 1..99 offset
 */
router.post('/create-invoice', (req: Request, res: Response) => {
  const workspaceId = (req as any).workspaceId || req.params.id || (req.body?.workspaceId as string) || 'default';
  const invoice = paymentService.createInvoice(workspaceId);
  const settings = paymentService.getSettings();

  res.json({
    success: true,
    invoice,
    paymentDetails: {
      cardNumber: invoice.cardNumber || settings.cardNumber,
      cardHolder: invoice.cardHolder || settings.cardHolder,
      exactAmount: invoice.totalAmount,
      currency: 'UZS',
      expiresAt: invoice.expiresAt,
      instruction: `Iltimos, kartaga aynan ${invoice.totalAmount.toLocaleString()} so'm o'tkazing. Tizim CardXabar / HumoCard orqali avtomatik tasdiqlaydi.`,
    },
  });
});


/**
 * Check if a specific invoice has been paid
 */
router.get('/check-invoice/:invoiceId', (req: Request, res: Response) => {
  const { invoiceId } = req.params;
  const invoice = paymentService.getInvoice(invoiceId);

  if (!invoice) {
    return res.status(404).json({ success: false, error: 'Invoys topilmadi' });
  }

  const workspaceId = invoice.workspaceId;
  const subStatus = paymentService.getSubscriptionStatus(workspaceId);

  res.json({
    success: true,
    invoice,
    isPaid: invoice.status === 'paid',
    subscription: subStatus,
  });
});

export default router;
