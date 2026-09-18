import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../core/theme/ThemeProvider';
import { tileIdsFor } from '../core/tileCatalog';
export const TileGallery=()=>{
  const {availableThemes}=useTheme();
  return <section className="tile-gallery" data-testid="tile-gallery"><h3 data-testid="tile-gallery-title">Kenalan dengan semua tile</h3><p data-testid="tile-gallery-count">79 gambar · 5 dunia kecil. Semuanya bisa muncul di papan.</p>{Object.values(availableThemes).map(theme=>{
    const ids=tileIdsFor(theme.id);
    return <details key={theme.id} data-testid={`tile-gallery-${theme.id}`}><summary data-testid={`tile-gallery-toggle-${theme.id}`}><b>{theme.name}</b><span>{ids.length} tile</span><ChevronDown size={17}/></summary><div className="tile-gallery-grid">{ids.map((id:string,i:number)=><figure key={id} data-testid={`tile-gallery-art-${id}`}><img src={theme.assets.tiles[id]} alt={id.replaceAll('_',' ')} loading="lazy"/><figcaption>{String(i+1).padStart(2,'0')}</figcaption></figure>)}</div></details>;
  })}</section>;
};