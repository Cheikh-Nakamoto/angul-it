import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Capchat } from './capchat/capchat';

export const routes: Routes = [
    {path:"",component:Home},
    {path:"capchat",component:Capchat}
];
