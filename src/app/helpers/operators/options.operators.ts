import { uniq } from 'lodash-es';
import { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { Choices } from 'app/interfaces/choices.interface';
import { MapOption, Option } from 'app/interfaces/option.interface';
import { ignoreTranslation } from 'app/modules/translate/translate.helper';

/**
 * Convert choices to options
 * @returns Option[]
 */
export function choicesToOptions(): OperatorFunction<Choices, Option[]> {
  return map((choices) => {
    return Object.entries(choices).map(
      ([value, label]) => ({ label: ignoreTranslation(label), value }),
    );
  });
}

/**
 * Transfers array of tuples to array of options:
 * ```
 * [['value1', 'label1'], ['value2', 'label2']]
 * ```
 */
export function arrayToOptions(): OperatorFunction<MapOption[], Option[]> {
  return map((choices) => {
    return choices.map(([value, label]) => ({ label: ignoreTranslation(label), value }));
  });
}

/**
 * Transfers normal array to array of options:
 * ```
 * ['value1', 'value2', 'value3'],
 * ```
 */
export function singleArrayToOptions(): OperatorFunction<(string | number)[], Option[]> {
  return map((choices) => {
    return choices.map((choice) => ({ label: ignoreTranslation(String(choice)), value: choice }));
  });
}

export function redundantListToUniqueOptions(): OperatorFunction<string[], Option[]> {
  return map((redundantArray) => {
    return uniq(redundantArray).map((item: string) => ({ label: ignoreTranslation(item), value: item }));
  });
}

export function idNameArrayToOptions<T = number>(): OperatorFunction<{ id: T; name: string }[], Option<T>[]> {
  return map((options) => {
    return options.map((option) => ({ label: ignoreTranslation(option.name), value: option.id }));
  });
}
