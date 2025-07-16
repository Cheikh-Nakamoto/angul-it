import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Capchat } from './capchat/capchat';
import { Result } from './result/result';
import { Success } from './services/success';

export const routes: Routes = [
    { path: "", component: Home },
    { path: "captcha", component: Capchat },
    { path: "result", component: Result, canActivate: [Success] }
];
