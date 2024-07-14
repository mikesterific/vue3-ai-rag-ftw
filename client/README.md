# HCSelect.vue Component

Functionality

- Dropdown with custom label.
- Supports dynamic options and disabled state.
- Two-way data binding with modelValue.

## Props

```
label: String,
options: Array,
modelValue: [String, Number],
disabled: Boolean
```

## Events

```
update:modelValue: Updates modelValue.
```

## Example Usage

```
<HCSelect
  :label="'OS'"
  :modelValue="form.operatingSystem"
  @update:modelValue="(newValue) => (form.operatingSystem = newValue)"
  :options="[
    { label: 'Windows', value: 'os_windows_server_2012' },
    { label: 'Other', value: 'os_other' },
  ]"
  data-testid="OS"
/>
```

## Testing

Query via data-testid="OS" for testing.
