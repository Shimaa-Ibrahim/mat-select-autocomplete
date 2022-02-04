import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
  DoCheck,
} from '@angular/core';
import { FormControl } from '@angular/forms';

export interface ElementsSelectors {
  inputField: string;
  selectField: string;
  clearFieldIcon: string;
  clearSelection: string;
  searchField?: string
}
@Component({
  selector: 'mat-select-autocomplete',
  templateUrl: './select-autocomplete.component.html',
  styleUrls: ['./select-autocomplete.component.scss']
})
export class SelectAutocompleteComponent implements OnChanges, DoCheck {
  @Input() selectPlaceholder: string = 'search...';
  @Input() placeholder: string;
  @Input() options: any[];
  @Input() disabled: boolean = false;
  @Input() display: string = 'display';
  @Input() value: any = 'value';
  @Input() fieldFormControl: FormControl = new FormControl();
  @Input() errorMsg: string = 'Field is required';
  @Input() showErrorMsg: boolean = false;
  @Input() selectedOptions: any[];
  @Input() multiple: boolean = true;
  @Input() labelCount: number = 1;
  @Input() appearance: 'standard' | 'fill' | 'outline' = 'standard';
  @Input() fieldsSelectors: ElementsSelectors;

  @Output() selectionChange: EventEmitter<any> = new EventEmitter();

  @ViewChild('selectElem', { static: false }) selectElem;
  @ViewChild('searchInput', { static: false }) searchInput;


  originOptions: Array<any> = [];
  filteredOptions: Array<any> = [];
  selectedValue: Array<any> = [];
  selectAllChecked = false;

  constructor() { }
  ngOnChanges(): void {
    if (this.disabled) {
      this.fieldFormControl.disable();
    } else {
      this.fieldFormControl.enable();
    }
    this.filteredOptions = this.originOptions = this.options = this.options.sort(this.sortOptions());
    if (this.selectedOptions) {
      this.selectedValue = this.selectedOptions;
    } else if (this.fieldFormControl.value) {
      this.selectedValue = this.fieldFormControl.value;
    }
    this.rearrangOptions();
  }

  ngDoCheck(): void {
    if (!this.selectedValue.length) {
      this.selectionChange.emit(this.selectedValue);
    }
  }

  toggleDropdown(): void {
    this.selectElem.toggle();
  }

  toggleSelectAll(val): void {
    if (val.checked) {
      this.filteredOptions.forEach(option => {
        if (!this.selectedValue.includes(option[this.value])) {
          this.selectedValue = this.selectedValue.concat([option[this.value]]);
        }
      });
    } else {
      const filteredOptions = this.filteredOptions.map(item => item[this.value]);
      this.selectedValue = this.selectedValue.filter(item => !filteredOptions.includes(item));
    }
    this.selectionChange.emit(this.selectedValue);
  }


  onSelectionChange(val): void {
    this.checkIfAllSelected();
    this.selectedValue = val.value;
    this.selectionChange.emit(this.selectedValue);
  }

  onDisplayString() {
    let displayString = '';
    if (this.selectedValue && this.selectedValue.length) {
      if (this.multiple) {
        const displayOption = this.options.filter(opt => this.selectedValue.includes(opt[this.value])).map(opt => opt[this.display]);
        const resetOptionsCount = displayOption.length - this.labelCount;
        displayString = displayOption.slice(0, this.labelCount).join(',');
        if (resetOptionsCount > 0) displayString += `(+${resetOptionsCount}) others`
      } else {
        const displayOption = this.options.find(option => option[this.value] === this.selectedValue);
        displayString = displayOption ? displayOption[this.display] : '';
      }
    }
    return displayString;
  }

  setFocus(event): void {
    if (event) this.searchInput.nativeElement.focus();
  }

  filterItem(value) {
    this.filteredOptions = this.options.filter(item => item[this.display].toLowerCase().indexOf(value.toLowerCase()) > -1);
    this.checkIfAllSelected();
  }

  hideOption(option) {
    return (this.filteredOptions.indexOf(option) == -1);
  }

  clearSelection(): void {
    this.selectAllChecked = false;
    this.selectedValue = [];
    this.selectionChange.emit(this.selectedValue);
  }

  checkIfAllSelected(): void {
    if (this.multiple && this.filteredOptions.length > 0) {
      this.selectAllChecked = this.filteredOptions.every(item => this.selectedValue.includes(item[this.value]));
    }
  }


  rearrangOptions(): void {
    const selectedOptions = [];
    const unselectedOptions = [];
    this.originOptions.forEach(option => {
      if (this.selectedValue.includes(option[this.value])) {
        selectedOptions.push(option);
      } else {
        unselectedOptions.push(option);
      }

    });
    this.options = (this.selectedValue.length === 0) ? this.originOptions : [
      ...selectedOptions,
      ...unselectedOptions
    ];
  }


  sortOptions() {
    return (a, b) => {
      const nameA = a[this.display].toUpperCase();
      const nameB = b[this.display].toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    };
  }
}


