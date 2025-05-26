import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { PaymentMethodService } from 'src/app/services/payment-method.service';
import { InvoiceService } from '../../services/invoice.service';
import { CartItem } from '../../models/cart-item';
import { deliveryData } from '../../models/delivery-data.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss', '../../shared/form-validation.scss'],
})
export class CheckoutComponent implements OnInit {
  secondStepPassed = false;
  thirdStepPassed = false;
  cartItems: CartItem[] = [];
  deliveryData: deliveryData = {
    name: '',
    surname: '',
    adress: '',
    city: '',
    zipCode: '',
    country: '',
    email: '',
    phone: '',
  };
  totalPrice: number = 0;
  shipping: number = 0;

  deliveryForm: FormGroup;
  errors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private invoiceService: InvoiceService,
    public paymentMethodService: PaymentMethodService
  ) {
    this.deliveryForm = this.fb.group({
      name: new FormControl('', [Validators.required]),
      surname: new FormControl('', [Validators.required]),
      adress: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      zipCode: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(9),
      ]),
    });
  }

  ngOnInit(): void {
    this.cartItems = this.cartService.getCartItems();
    this.deliveryData = this.getDeliveryData();
    this.totalPrice = this.cartService.getTotalPrice();
    this.shipping = this.totalPrice > 100 ? 0 : 10;
  }

  onSubmit() {
    if (this.deliveryForm.valid) {
      this.secondStepPassed = true;
      this.deliveryData = this.deliveryForm.value;
      localStorage.setItem('deliveryData', JSON.stringify(this.deliveryData));
    }
  }

  getDeliveryData() {
    // prevent losing data after page refresh
    return JSON.parse(localStorage.getItem('deliveryData') || '{}');
  }

  async onConfirm() {
    try {
      // Create invoice
      await this.invoiceService.createInvoice(
        this.cartItems,
        this.deliveryData,
        this.totalPrice,
        this.shipping,
        this.paymentMethodService.paymentMethod
      );

      this.thirdStepPassed = true;
      this.cartService.clearCart();
      localStorage.removeItem('deliveryData');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error processing order. Please try again.');
    }
  }
}
