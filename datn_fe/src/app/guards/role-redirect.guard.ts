import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth/auth.service';
import { RoleUtil } from '../util/role.util';

@Injectable({
  providedIn: 'root'
})
export class RoleRedirectGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Only redirect from home page ('/')
    if (state.url !== '/') {
      return true;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.roleId) {
      return true;
    }

    // Get default route based on user role
    const role = RoleUtil.getRoleFromRoleId(currentUser.roleId);
    const defaultRoute = RoleUtil.getDefaultRoute(role);

    // If default route is different from current route, navigate to it
    if (defaultRoute !== '/') {
      this.router.navigate([defaultRoute]);
      return false;
    }

    return true;
  }
}

export const roleRedirectGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return inject(RoleRedirectGuard).canActivate(route, state);
};



