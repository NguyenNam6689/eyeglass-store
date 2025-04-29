import { NgModule } from "@angular/core"
import { RouterModule, type Routes } from "@angular/router"

const routes: Routes = [
  {
    path: "auth",
    children: [
      {
        path: "login",
        loadComponent: () => import("./auth/login/login.component").then((m) => m.LoginComponent),
      },
      {
        path: "register",
        loadComponent: () => import("./auth/register/register.component").then((m) => m.RegisterComponent),
      },
    ],
  },
  {
    path: "",
    redirectTo: "/auth/login",
    pathMatch: "full",
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
