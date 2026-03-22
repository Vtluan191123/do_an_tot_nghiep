import {firstValueFrom, Observable} from 'rxjs';

export async function getInfoCurrentUser(infoCurrentUser: Observable<any>) {
  return await firstValueFrom(infoCurrentUser);
}
