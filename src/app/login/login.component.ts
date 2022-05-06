import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { ToastrService } from 'ngx-toastr';
import { GoogleLoginProvider } from 'angularx-social-login';
import { SocialAuthService } from "angularx-social-login";
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  token: any;
  googleUser: any
  loginURL = 'http://localhost:8080/api/user/login'
  constructor(private socialAuthService: SocialAuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private auth: AuthService) { }

  ngOnInit(): void {


    localStorage.clear()
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],

    });
  }
  login() {
    if (this.loginForm.invalid) {
      for (const control of Object.keys(this.loginForm.controls)) {
        this.loginForm.controls[control].markAsTouched();
      }
      return;
    }

    this.auth.userLogin(this.loginForm.value).subscribe((data: any) => {
      console.log(data);
      this.token = data.token;
      localStorage.setItem('token', JSON.stringify(this.token));
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      this.router.navigate(['/feed']);
      this.toastr.success("Logged in successfully !!", data.message)
    }
      , (err) => {
        this.toastr.error("Login invalid", "Bad request")
      });
  }

  signupWithGoogle() {
    this.socialAuthService?.signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((res: any) => {
        console.log(res);

        this.googleUser = res

        localStorage.setItem('token', JSON.stringify(this.googleUser.authToken));
        let user = {
          firstName: this.googleUser.firstName,
          lastName: this.googleUser.lastName,
          email: this.googleUser.email,
          mobile: "",
          gender: "",
          bio: "",
          photo: this.googleUser.photoUrl,
          name: this.googleUser.name,
          dob: "",
          password: this.googleUser.email,
        }
        this.auth.googleUserLogin(user).subscribe((res: any) => {
         console.log(res);

          this.http.post<any>(this.loginURL, { email: res.user.email, password: res.user.email }).subscribe((data: any) => {
            console.log(data);
            this.token = data.token;
            localStorage.setItem('token', JSON.stringify(this.token));
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            this.router.navigate(['/feed']);
            this.toastr.success("Logged in successfully !!", data.message)
          }
            , (err) => {
              this.toastr.error("Login invalid", "Bad request")
            });
        })

      })
      .catch((err) => {
        console.log(err);

      });
  }
}
