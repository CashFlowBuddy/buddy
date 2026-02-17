import { cn } from '@/lib/utils';
import * as SeparatorPrimitive from '@rn-primitives/separator';

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorPrimitive.RootProps & React.RefAttributes<SeparatorPrimitive.RootRef>) {
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      style={{
        ...(orientation === 'horizontal' 
          ? { height: 1, borderTopWidth: 1, borderTopColor: 'hsl(0 0% 80%)' }
          : { width: 1, borderLeftWidth: 1, borderLeftColor: 'hsl(0 0% 80%)' })
      }}
      className={cn('shrink-0', className)}
      {...props}
    />
  );
}

export { Separator };
