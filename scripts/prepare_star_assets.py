"""Extract only licensed game sprites; never overwrite existing artwork."""
from pathlib import Path
from zipfile import ZipFile

names = ['playerShip1_blue','playerShip2_red','playerShip3_blue','playerShip3_red','playerShip2_green','playerShip1_orange','enemyRed1','enemyGreen2','enemyBlack3','ufoRed','laserBlue01','laserGreen01','laserRed01','meteorGrey_big1','shield_gold','bolt_gold','star_gold','powerupBlue_shield','powerupYellow_bolt','pill_green','shield3','fire00','fire01','fire02','fire03','fire04','fire05','star2']
dest=Path('/app/public/art/star-patrol');dest.mkdir(parents=True,exist_ok=True)
with ZipFile('/tmp/space-shooter.zip') as z:
    for name in z.namelist():
        path=Path(name)
        if path.stem in names and path.suffix=='.png':
            (dest/path.name).write_bytes(z.read(name))
        if name=='Backgrounds/black.png':(dest/'stars.png').write_bytes(z.read(name))
        if name=='license.txt':(dest/'LICENSE.txt').write_bytes(z.read(name))
print(f'{len(list(dest.iterdir()))} Star Patrol asset files extracted')