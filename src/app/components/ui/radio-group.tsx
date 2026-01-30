"use client";

import * as React from "react";
import { CircleIcon } from "lucide-react";

import { cn } from "./utils";

type RadioGroupContextValue = {
  name: string;
  value?: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

function RadioGroup({
  className,
  children,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled,
  ...props
}: any) {
  // Provide a name if none passed so native radios group properly
  const generatedName = React.useId();
  const groupName = name || `radio-${generatedName}`;

  const contextValue = React.useMemo(
    () => ({ name: groupName, value, onChange: onValueChange, disabled }),
    [groupName, value, onValueChange, disabled]
  );

  return (
    <div data-slot="radio-group" className={cn("grid gap-3", className)} {...props}>
      <RadioGroupContext.Provider value={contextValue}>{children}</RadioGroupContext.Provider>
    </div>
  );
}

const RadioGroupItem = React.forwardRef<HTMLLabelElement, any>(
  ({ className, children, value, id, disabled, ...props }, ref) => {
    const ctx = React.useContext(RadioGroupContext);
    const name = ctx?.name || undefined;
    const checked = ctx?.value !== undefined ? ctx.value === value : undefined;

    const handleChange = () => {
      if (ctx?.onChange) ctx.onChange(value);
    };

    return (
      <label
        ref={ref}
        data-slot="radio-group-item"
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer",
          className
        )}
      >
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={handleChange}
          disabled={disabled || ctx?.disabled}
          className="sr-only"
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            "w-4 h-4 rounded-full border flex items-center justify-center",
            checked ? "bg-primary border-transparent" : "bg-white border-gray-300"
          )}
        >
          {/* Keep CircleIcon for visual indicator when checked */}
          {checked ? <CircleIcon className="w-3 h-3 text-white" /> : null}
        </span>
        {/* Render any children (labels/text) next to the radio */}
        <span>{children}</span>
      </label>
    );
  }
);

RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
