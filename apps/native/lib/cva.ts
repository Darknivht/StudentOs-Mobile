type VariantConfig<T extends string = string> = {
  variants?: Record<string, Record<T, string>>;
  defaultVariants?: Record<string, T>;
};

export function cva(
  base: string,
  config?: VariantConfig,
): (props?: Record<string, string | undefined>) => string {
  return (props) => {
    let classes = base;

    if (config?.variants) {
      const merged = { ...config.defaultVariants, ...props };
      for (const [key, value] of Object.entries(merged)) {
        if (value && config.variants[key]?.[value]) {
          classes = `${classes} ${config.variants[key][value]}`;
        }
      }
    }

    return classes;
  };
}
