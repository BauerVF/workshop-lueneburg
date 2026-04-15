import { signal, computed, Signal, WritableSignal } from '@angular/core';

export interface DateSelection {
  availableDates: Signal<string[]>;
  selectedDate: WritableSignal<string>;
  activeDate: Signal<string>;
  onDateChange(event: Event): void;
}

export function createDateSelection(uniqueDates: Signal<string[]>): DateSelection {
  const selectedDate = signal('');

  const activeDate = computed(() => {
    const sel = selectedDate();
    if (sel) return sel;
    const dates = uniqueDates();
    return dates.length > 0 ? dates[dates.length - 1] : '';
  });

  return {
    availableDates: uniqueDates,
    selectedDate,
    activeDate,
    onDateChange(event: Event): void {
      const select = event.target as HTMLSelectElement;
      selectedDate.set(select.value);
    },
  };
}
