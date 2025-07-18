import { select, Selector } from '@ngrx/store';
import { Observable, pipe, UnaryFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

export function selectNotNull<S, R>(
  selector: Selector<S, R>,
): UnaryFunction<Observable<S>, Observable<Exclude<R, null>>> {
  return pipe(
    select(selector),
    filter((value): value is Exclude<R, null> => value !== null),
  );
}
