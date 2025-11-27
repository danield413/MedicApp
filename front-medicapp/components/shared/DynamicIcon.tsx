import * as Icons from '@/components/icons'

// 1. Mapa de Traducción
// La clave (string) es el nombre que llega de tu API.
// El valor es el componente real que importamos.
const friendlyNameToComponentMap = {
  'file-text': Icons.FileTextIcon,
  'bar-chart': Icons.ChartIcon,
  'users': Icons.UserIcon, // O podrías usar UserCircleIcon si lo prefieres
  'building': Icons.BuildingIcon,
  'shield': Icons.ShieldCheckIcon,
  'cog': Icons.SettingsIcon,
  // --- Añade aquí cualquier otro ícono que necesites ---
  'archive': Icons.ArchiveIcon,
  'briefcase': Icons.BriefcaseIcon,
  'plus': Icons.PlusIcon,
  // etc...
};

// Generamos un tipo a partir de las claves de nuestro mapa
export type FriendlyIconName = keyof typeof friendlyNameToComponentMap;

export interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
  name: FriendlyIconName;
}

export const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  // 2. Buscamos el componente en nuestro nuevo mapa
  const IconComponent = friendlyNameToComponentMap[name];

  if (!IconComponent) {
    // Si no se encuentra, podemos renderizar un ícono por defecto o nada
    console.warn(`Icono "${name}" no encontrado en el mapa.`);
    return null;
  }

  return <IconComponent {...props} />;
};