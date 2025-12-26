
declare const PIXI: any;
declare const gsap: any;

export class WorkshopApp {
  public app: any;
  public world: any;
  public layers: {
    bg: any,
    mid: any,
    fore: any,
    overlay: any
  };
  public snowParticles: any[] = [];
  private width: number = window.innerWidth;
  private height: number = window.innerHeight;

  constructor(container: HTMLElement) {
    this.app = new PIXI.Application({
      resizeTo: window,
      backgroundColor: 0xffffff,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    container.appendChild(this.app.view);
    
    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);
    
    this.layers = {
      bg: new PIXI.Container(),
      mid: new PIXI.Container(),
      fore: new PIXI.Container(),
      overlay: new PIXI.Container()
    };
    
    this.world.addChild(this.layers.bg);
    this.world.addChild(this.layers.mid);
    this.world.addChild(this.layers.fore);
    this.world.addChild(this.layers.overlay);
    
    this.setupScene();
    this.setupSnow();
  }

  private drawStarPoly(g: any, x: number, y: number, points: number, radius: number, innerRadius: number) {
    const step = Math.PI / points;
    const path = [];
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? radius : innerRadius;
        const a = i * step - Math.PI / 2;
        path.push(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    g.drawPolygon(path);
  }

  private setupScene() {
    const groundY = this.app.screen.height * 0.85;

    // 1. BG LAYER (Sky and Wall)
    const sky = new PIXI.Graphics();
    sky.beginFill(0x87ceeb);
    sky.drawRect(0, 0, 4000, 2000);
    this.layers.bg.addChild(sky);

    const wall = new PIXI.Graphics();
    wall.beginFill(0xfff5e6); 
    wall.drawRect(0, 0, 4000, groundY);
    wall.beginFill(0x8d5524); // baseboard
    wall.drawRect(0, groundY - 30, 4000, 30);
    this.layers.bg.addChild(wall);

    // Sleigh silhouette (Parallax background detail)
    this.drawSleighSilhouette(3200, 200);

    // Wall Details: Poster and Shelf
    this.drawWallDetails(groundY);

    // 2. MID LAYER (Tree, Fireplace)
    const floor = new PIXI.Graphics();
    floor.beginFill(0xbc8f8f);
    floor.drawRect(0, groundY, 4000, this.app.screen.height - groundY + 200);
    floor.lineStyle(2, 0x8b4513, 0.1);
    for (let i = 0; i < 400; i += 40) {
      floor.moveTo(0, groundY + i);
      floor.lineTo(4000, groundY + i);
    }
    this.layers.mid.addChild(floor);

    this.drawGarlands();

    // Fireplace position - adjusted for tour visibility
    const fireplace = this.drawFireplace(1800, groundY - 20);
    this.layers.mid.addChild(fireplace);

    // Tree position - adjusted for tour visibility
    const tree = this.drawTree(1200, groundY);
    this.layers.mid.addChild(tree);

    // 3. FORE LAYER (Elves, Table, Gifts, Candies)
    const giftPile = this.drawGiftPile(1200, groundY);
    this.layers.fore.addChild(giftPile);

    const table = this.drawTable(2600, groundY);
    this.layers.fore.addChild(table);

    this.drawCandyDetails(2600, groundY);

    const elf1 = this.drawElf(1300, groundY + 20, 0xff4d4d);
    const elf2 = this.drawElf(2200, groundY + 20, 0x4dff88);
    const elf3 = this.drawElf(3000, groundY + 20, 0x4d94ff);
    
    this.layers.fore.addChild(elf1);
    this.layers.fore.addChild(elf2);
    this.layers.fore.addChild(elf3);

    // Shadow grounding
    [tree, fireplace, table, elf1, elf2, elf3].forEach(obj => {
      const shadow = new PIXI.Graphics();
      shadow.beginFill(0x000000, 0.15);
      shadow.drawEllipse(0, 0, 80, 20);
      shadow.position.set(obj.x, groundY + (obj === fireplace ? 10 : 15));
      this.layers.mid.addChildAt(shadow, 1);
    });
  }

  private drawSleighSilhouette(x: number, y: number) {
    const s = new PIXI.Container();
    const g = new PIXI.Graphics();
    g.beginFill(0x5a8fb3, 0.4); 
    g.drawRoundedRect(0, 50, 150, 40, 10);
    g.drawRect(130, 20, 20, 40);
    for(let i=0; i<3; i++) {
        g.drawCircle(-40 - i*60, 60, 10);
        g.drawRect(-45 - i*60, 45, 10, 20);
    }
    s.addChild(g);
    s.position.set(x, y);
    this.layers.bg.addChild(s);

    for(let i=0; i<3; i++) {
        const star = new PIXI.Graphics();
        star.beginFill(0xffffff, 0.8);
        this.drawStarPoly(star, 0, 0, 4, 8, 3);
        star.position.set(x + Math.random()*300 - 150, y + Math.random()*100 - 50);
        this.layers.bg.addChild(star);
        gsap.to(star, { alpha: 0.2, duration: 1 + Math.random(), repeat: -1, yoyo: true });
    }
  }

  private drawWallDetails(groundY: number) {
    const poster = new PIXI.Container();
    const pG = new PIXI.Graphics();
    pG.beginFill(0xffffff);
    pG.lineStyle(4, 0x8d5524);
    pG.drawRect(0, 0, 100, 140);
    poster.addChild(pG);
    const pT = new PIXI.Text("NICE\nLIST", { fontSize: 16, fontWeight: 'bold', align: 'center', fill: 0x2d5a27 });
    pT.anchor.set(0.5); pT.position.set(50, 70);
    poster.addChild(pT);
    poster.position.set(1600, 200);
    this.layers.bg.addChild(poster);

    const shelf = new PIXI.Graphics();
    shelf.beginFill(0x8d5524);
    shelf.drawRect(0, 0, 200, 15);
    shelf.position.set(2400, 350);
    this.layers.bg.addChild(shelf);

    const train = new PIXI.Graphics();
    train.beginFill(0xff4d4d); train.drawRect(20, -30, 40, 30);
    train.beginFill(0x222222); train.drawCircle(30, 0, 8); train.drawCircle(50, 0, 8);
    train.position.set(2400, 350);
    this.layers.bg.addChild(train);
    
    const teddy = new PIXI.Graphics();
    teddy.beginFill(0x8b4513); teddy.drawCircle(120, -25, 20); teddy.drawCircle(105, -40, 8); teddy.drawCircle(135, -40, 8);
    teddy.position.set(2400, 350);
    this.layers.bg.addChild(teddy);
  }

  private drawGiftPile(x: number, y: number) {
    const pile = new PIXI.Container();
    const colors = [0xff4d4d, 0x4dff88, 0xffd700, 0x4d94ff];
    for(let i=0; i<8; i++) {
        const g = new PIXI.Graphics();
        const color = colors[i % colors.length];
        const w = 40 + Math.random()*40;
        const h = 30 + Math.random()*30;
        g.beginFill(color);
        g.drawRoundedRect(-w/2, -h, w, h, 4);
        g.beginFill(0xffffff, 0.5);
        g.drawRect(-w/2, -h + h/2 - 4, w, 8);
        g.drawRect(-4, -h, 8, h);
        g.beginFill(0xffffff, 0.8);
        g.drawCircle(0, -h, 6);
        g.position.set((Math.random()-0.5)*150, 0);
        pile.addChild(g);
    }
    pile.position.set(x, y);
    return pile;
  }

  private drawCandyDetails(x: number, y: number) {
    const drawCane = (cx: number) => {
        const c = new PIXI.Graphics();
        c.lineStyle(6, 0xffffff);
        c.moveTo(0, 0); c.lineTo(0, -60); c.arc(10, -60, 10, Math.PI, 0);
        c.lineStyle(2, 0xff4d4d); 
        c.position.set(cx, y);
        c.rotation = -0.2;
        this.layers.fore.addChild(c);
    };
    drawCane(x - 100);
    drawCane(x - 85);

    const plate = new PIXI.Graphics();
    plate.beginFill(0xf0f0f0); plate.drawEllipse(0, 0, 50, 15);
    plate.beginFill(0x8b4513); 
    plate.drawCircle(0, -5, 12); plate.drawRect(-4, 0, 8, 10);
    plate.lineStyle(1, 0xffffff); plate.drawCircle(0, -5, 13); 
    plate.position.set(x + 60, y - 60);
    this.layers.fore.addChild(plate);
  }

  private drawGarlands() {
    const g = new PIXI.Graphics();
    g.lineStyle(4, 0x2d5a27);
    for (let i = 0; i < 4000; i += 200) {
      g.bezierCurveTo(i + 50, 50, i + 150, 50, i + 200, 0);
    }
    for (let i = 0; i < 4000; i += 100) {
      const color = [0xff0000, 0xffff00, 0xffffff, 0x00ff00][(i/100)%4];
      g.beginFill(color);
      g.drawCircle(i, 30, 6);
    }
    this.layers.bg.addChild(g);
  }

  private drawTree(x: number, y: number) {
    const container = new PIXI.Container();
    const g = new PIXI.Graphics();
    // Trunk
    g.beginFill(0x5c4033);
    g.drawRect(-20, -40, 40, 40);
    // Tree Body
    g.beginFill(0x1b4d1b);
    g.drawPolygon([-150, -40, 150, -40, 0, -200]);
    g.drawPolygon([-120, -120, 120, -120, 0, -280]);
    g.drawPolygon([-90, -200, 90, -200, 0, -360]);
    
    // CRITICAL: Add the tree body graphics to the container
    container.addChild(g);

    // Pulsing Ornaments
    for (let i = 0; i < 20; i++) {
      const orn = new PIXI.Graphics();
      const color = [0xffd700, 0xff4d4d, 0x4d94ff, 0xffffff][i % 4];
      orn.beginFill(color);
      const rx = (Math.random() - 0.5) * 160;
      const ry = -40 - Math.random() * 300;
      orn.drawCircle(0, 0, 8);
      orn.position.set(rx, ry);
      container.addChild(orn);
      gsap.to(orn, { alpha: 0.4, duration: 1 + Math.random(), repeat: -1, yoyo: true });
    }
    
    // Star with Sparkles
    const star = new PIXI.Graphics();
    star.beginFill(0xfff000);
    this.drawStarPoly(star, 0, 0, 5, 25, 12);
    star.position.set(0, -370);
    container.addChild(star);
    
    // Tiny sparkles
    for(let i=0; i<4; i++) {
        const sp = new PIXI.Graphics();
        sp.beginFill(0xffffff, 0.9); this.drawStarPoly(sp, 0,0, 4, 6, 2);
        sp.position.set((Math.random()-0.5)*100, -370 + (Math.random()-0.5)*100);
        container.addChild(sp);
        gsap.to(sp, { alpha: 0, scale: 0.2, duration: 0.8+Math.random(), repeat: -1 });
    }
    
    container.position.set(x, y);
    return container;
  }

  private drawFireplace(x: number, y: number) {
    const container = new PIXI.Container();
    const g = new PIXI.Graphics();
    g.beginFill(0xa0522d);
    g.drawRoundedRect(-120, -180, 240, 180, 15);
    g.beginFill(0x2d1e1e);
    g.drawRoundedRect(-70, -130, 140, 130, 10);
    
    const glow = new PIXI.Graphics();
    glow.beginFill(0xffa500, 0.1);
    glow.drawCircle(0, -60, 200);
    container.addChildAt(glow, 0);
    gsap.to(glow, { alpha: 0.14, duration: 0.15, repeat: -1, yoyo: true });

    const fire = new PIXI.Graphics();
    fire.beginFill(0xff4500);
    fire.drawEllipse(0, -20, 40, 30);
    fire.beginFill(0xffd700);
    fire.drawEllipse(0, -20, 25, 15);
    gsap.to(fire, { scale: 1.1, duration: 0.1, repeat: -1, yoyo: true });
    
    container.addChild(g);
    container.addChild(fire);
    container.position.set(x, y);
    return container;
  }

  private drawTable(x: number, y: number) {
    const container = new PIXI.Container();
    const g = new PIXI.Graphics();
    g.beginFill(0x8b4513);
    g.drawRect(-120, -60, 240, 20);
    g.drawRect(-110, -40, 15, 40);
    g.drawRect(95, -40, 15, 40);
    
    const mug = new PIXI.Container();
    const mG = new PIXI.Graphics();
    mG.beginFill(0xef4444); mG.drawRoundedRect(0, -40, 40, 40, 8);
    mG.beginFill(0xffffff); mG.drawCircle(20, -40, 10);
    mug.addChild(mG);
    
    const steam = new PIXI.Graphics();
    steam.lineStyle(3, 0xffffff, 0.4);
    steam.moveTo(20, -50); steam.bezierCurveTo(10, -60, 30, -70, 20, -80);
    mug.addChild(steam);
    gsap.to(steam, { y: -10, alpha: 0, duration: 1.5, repeat: -1 });

    mug.position.set(0, -60);
    container.addChild(g);
    container.addChild(mug);
    container.position.set(x, y);
    return container;
  }

  private drawElf(x: number, y: number, color: number) {
    const container = new PIXI.Container();
    const g = new PIXI.Graphics();
    g.beginFill(color); g.drawRoundedRect(-30, -60, 60, 60, 20);
    g.beginFill(0xffdbac); g.drawCircle(0, -90, 35);
    
    const eyes = new PIXI.Graphics();
    eyes.beginFill(0x222222);
    eyes.drawCircle(-12, -95, 4); eyes.drawCircle(12, -95, 4);
    container.addChild(g);
    container.addChild(eyes);

    g.lineStyle(3, 0x222222);
    g.arc(0, -85, 10, 0.1 * Math.PI, 0.9 * Math.PI);
    g.beginFill(color);
    g.drawPolygon([-40, -115, 40, -115, 0, -170]);
    g.beginFill(0xffffff);
    g.drawCircle(0, -170, 10);
    
    container.position.set(x, y);
    gsap.to(container, { y: y - 10, duration: 0.6 + Math.random()*0.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
    return container;
  }

  private setupSnow() {
    for (let i = 0; i < 180; i++) {
      const s = new PIXI.Graphics();
      const size = Math.random() * 5 + 2;
      s.beginFill(0xffffff, Math.random() * 0.4 + 0.3);
      s.drawCircle(0, 0, size);
      s.x = Math.random() * this.app.screen.width;
      s.y = Math.random() * this.app.screen.height;
      this.app.stage.addChild(s);
      this.snowParticles.push({ obj: s, speed: Math.random() * 1.5 + 0.8, phase: Math.random() * Math.PI * 2 });
    }
    
    this.app.ticker.add(() => {
      this.snowParticles.forEach(p => {
        p.obj.y += p.speed;
        p.obj.x += Math.sin(p.phase + p.obj.y / 60) * 0.4;
        if (p.obj.y > this.app.screen.height) {
            p.obj.y = -20;
            p.obj.x = Math.random() * this.app.screen.width;
        }
      });
    });
  }

  public runWorkshopPan(onComplete: () => void) {
    const duration = 6;
    // Parallax Pan - adjusted targets to keep centerpiece visible
    gsap.to(this.layers.bg, { x: -1000, duration, ease: "power2.inOut" });
    gsap.to(this.layers.mid, { x: -1600, duration, ease: "power2.inOut" });
    gsap.to(this.layers.fore, { 
      x: -2000, 
      duration, 
      ease: "power2.inOut",
      onComplete: () => {
        gsap.to(this.world.scale, {
            x: 1.05, y: 1.05,
            duration: 1.2,
            ease: "back.out(1.7)",
            onComplete
        });
        gsap.to(this.world, {
            x: -40, y: -20,
            duration: 1.2,
            ease: "back.out(1.7)"
        });
      }
    });
  }

  public skipPan() {
    gsap.killTweensOf(this.layers.bg);
    gsap.killTweensOf(this.layers.mid);
    gsap.killTweensOf(this.layers.fore);
    gsap.killTweensOf(this.world.scale);
    this.layers.bg.x = -1000;
    this.layers.mid.x = -1600;
    this.layers.fore.x = -2000;
    this.world.scale.set(1.05);
    this.world.position.set(-40, -20);
  }

  public resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.app.renderer.resize(this.width, this.height);
    this.layers.bg.removeChildren();
    this.layers.mid.removeChildren();
    this.layers.fore.removeChildren();
    this.setupScene();
  }
}
