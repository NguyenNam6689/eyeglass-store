import { Component } from "@angular/core"
import { type FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import type { Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import type { SupabaseService } from "../../services/supabase.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  loginForm: FormGroup
  loading = false
  errorMessage = ""

  constructor(
    private formBuilder: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    })
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      return
    }

    this.loading = true
    this.errorMessage = ""

    try {
      const { email, password } = this.loginForm.value
      const { data, error } = await this.supabaseService.signIn(email, password)

      if (error) throw error

      // Check user role and redirect accordingly
      const { data: userData, error: userError } = await this.supabaseService.getUserProfile()

      if (userError) throw userError

      if (userData?.role === "admin") {
        this.router.navigate(["/admin/dashboard"])
      } else {
        this.router.navigate(["/"])
      }
    } catch (error: any) {
      this.errorMessage = error.message || "Đăng nhập thất bại. Vui lòng thử lại."
    } finally {
      this.loading = false
    }
  }
}
