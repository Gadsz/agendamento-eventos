import textwrap, html, sys
from playwright.sync_api import sync_playwright

COL = {
    "person": ("#08427B", "#ffffff"),
    "system": ("#1168BD", "#ffffff"),
    "ext": ("#8A8A8A", "#ffffff"),
    "container": ("#438DD5", "#ffffff"),
    "component": ("#85BBF0", "#0B2540"),
}
FONT = "Helvetica, Arial, 'Liberation Sans', sans-serif"

class Svg:
    def __init__(self, w, h):
        self.w, self.h, self.p = w, h, []
    def add(self, s): self.p.append(s)
    def text(self, x, y, s, size=13, bold=False, italic=False, fill="#222", anchor="middle"):
        self.add(f'<text x="{x}" y="{y}" font-size="{size}" font-family="{FONT}" '
                 f'font-weight="{"700" if bold else "400"}" font-style="{"italic" if italic else "normal"}" '
                 f'fill="{fill}" text-anchor="{anchor}">{html.escape(s)}</text>')
    def box(self, kind, x, y, w, h, title, tech=None, desc="", tsize=18, db=False):
        fill, fg = COL[kind]
        if db:
            ry = 14
            self.add(f'<path d="M{x},{y+ry} a{w/2},{ry} 0 0 1 {w},0 v{h-2*ry} a{w/2},{ry} 0 0 1 -{w},0 z" fill="{fill}" stroke="#2f2f2f" stroke-opacity=".35"/>')
            self.add(f'<path d="M{x},{y+ry} a{w/2},{ry} 0 0 0 {w},0" fill="none" stroke="#2f2f2f" stroke-opacity=".35"/>')
        else:
            self.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{fill}" stroke="#2f2f2f" stroke-opacity=".35"/>')
        tl = textwrap.wrap(title, int((w - 24) / (tsize * 0.58)))
        dl = textwrap.wrap(desc, int((w - 28) / 6.9)) if desc else []
        icon = 52 if kind == "person" else 0
        tot = icon + len(tl) * (tsize + 6) + (20 if tech else 0) + len(dl) * 18 + (8 if dl else 0)
        yy = y + (h - tot) / 2 + (12 if db else 0)
        cx = x + w / 2
        if kind == "person":
            self.add(f'<circle cx="{cx}" cy="{yy+12}" r="12" fill="#fff"/>')
            self.add(f'<path d="M{cx-22},{yy+46} q0,-22 22,-22 q22,0 22,22 z" fill="#fff"/>')
            yy += icon
        for ln in tl:
            yy += tsize + 6
            self.text(cx, yy - 5, ln, tsize, True, fill=fg)
        if tech:
            yy += 20
            self.text(cx, yy - 5, f"[{tech}]", 13, False, True, fg)
        if dl: yy += 8
        for ln in dl:
            yy += 18
            self.text(cx, yy - 5, ln, 13, False, False, fg)
    def boundary(self, x, y, w, h, title, tag):
        self.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="none" stroke="#444" stroke-width="1.5" stroke-dasharray="8 6"/>')
        self.text(x + 16, y + 28, title, 16, True, fill="#333", anchor="start")
        self.text(x + 16, y + 46, f"[{tag}]", 12, False, False, "#555", anchor="start")
    def arrow(self, pts, label=None, lpos=None):
        d = "M" + " L".join(f"{a},{b}" for a, b in pts)
        self.add(f'<path d="{d}" fill="none" stroke="#333" stroke-width="1.6" marker-end="url(#ah)"/>')
        if label:
            lx, ly = lpos
            n = len(label)
            wd = max(len(s) for s in label) * 6.7 + 16
            ht = 18 * n + 6
            self.add(f'<rect x="{lx-wd/2}" y="{ly-ht/2}" width="{wd}" height="{ht}" rx="4" fill="#fff" fill-opacity=".96"/>')
            for i, s in enumerate(label):
                self.text(lx, ly - ht / 2 + 16 + 18 * i, s, 12.5, False, i == 1 and s.startswith("["), "#333")
    def title(self, s):
        self.text(24, 34, s, 20, True, fill="#111", anchor="start")
    def save(self, path):
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" viewBox="0 0 {self.w} {self.h}">'
               f'<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">'
               f'<path d="M0,0 L10,5 L0,10 z" fill="#333"/></marker></defs>'
               f'<rect width="100%" height="100%" fill="#fff"/>' + "".join(self.p) + "</svg>")
        open(path, "w", encoding="utf-8").write(svg)

OUT = sys.argv[1]

# ---------- C1 ----------
s = Svg(1200, 780)
s.title("Nível 1 - Diagrama de Contexto")
s.box("person", 150, 70, 320, 160, "Estudante", None, "Consulta os próximos eventos e filtra por data")
s.box("person", 730, 70, 320, 160, "Atlética", None, "Cadastra, edita e exclui os seus eventos")
s.box("system", 375, 340, 450, 160, "Plataforma de Agendamento e Gestão de Eventos", "Sistema de software", "Aplicação web que centraliza os eventos esportivos e festas das atléticas de Cascavel")
s.box("ext", 375, 610, 450, 130, "Firebase (Google)", "Sistema externo", "Autenticação de usuários e banco de dados na nuvem")
s.arrow([(330, 230), (480, 340)], ["Visualiza e filtra eventos", "[HTTPS]"], (380, 285))
s.arrow([(870, 230), (720, 340)], ["Gerencia eventos", "[HTTPS]"], (820, 285))
s.arrow([(600, 500), (600, 610)], ["Autentica usuários e lê/grava dados", "[SDK Firebase]"], (790, 555))
s.save(f"{OUT}/c1-contexto.svg")

# ---------- C2 ----------
s = Svg(1360, 880)
s.title("Nível 2 - Diagrama de Contêineres")
s.box("person", 40, 60, 240, 140, "Estudante", None, "Consulta eventos")
s.box("person", 320, 60, 240, 140, "Atlética", None, "Gerencia eventos")
s.boundary(40, 290, 520, 340, "Plataforma de Agendamento e Gestão de Eventos", "Sistema de software")
s.box("container", 100, 370, 400, 180, "Aplicação Web (SPA)", "React + Vite, JavaScript", "Telas de login, gerenciamento de eventos e agenda; executa no navegador")
s.boundary(760, 290, 560, 560, "Firebase (Google)", "Sistema externo")
s.box("container", 830, 370, 420, 140, "Firebase Authentication", "Serviço gerenciado", "Cadastro e login por e-mail e senha")
s.box("container", 830, 610, 420, 170, "Cloud Firestore", "NoSQL orientado a documentos", "Coleções usuarios e eventos; aplica as regras de segurança", db=True)
s.arrow([(160, 200), (230, 370)], ["Usa", "[HTTPS]"], (186, 262))
s.arrow([(440, 200), (370, 370)], ["Usa", "[HTTPS]"], (414, 262))
s.arrow([(500, 440), (830, 440)], ["Cria conta e autentica", "[SDK Firebase]"], (665, 418))
s.arrow([(500, 520), (830, 690)], ["Lê e grava perfis e eventos,", "em tempo real [SDK Firebase]"], (665, 640))
s.save(f"{OUT}/c2-conteineres.svg")

# ---------- C3 ----------
s = Svg(1380, 920)
s.title("Nível 3 - Diagrama de Componentes da Aplicação Web")
s.boundary(30, 70, 920, 800, "Aplicação Web (SPA)", "Contêiner: React + Vite")
s.box("component", 290, 140, 360, 120, "App.jsx", "Componente React", "Observa a sessão e o perfil do usuário e exibe a tela do perfil", tsize=17)
s.box("component", 80, 370, 250, 140, "Login.jsx", "Componente React", "Cadastro e login; grava o perfil escolhido", tsize=17)
s.box("component", 370, 370, 250, 140, "Eventos.jsx", "Componente React", "Atlética: cadastra, edita e exclui os seus eventos", tsize=17)
s.box("component", 660, 370, 250, 140, "VisualizarEventos.jsx", "Componente React", "Estudante: lista os próximos eventos e filtra por data", tsize=17)
s.box("component", 370, 660, 250, 130, "firebase.js", "Módulo JavaScript", "Inicializa o SDK e exporta auth e db", tsize=17)
s.box("ext", 1040, 440, 300, 130, "Firebase Authentication", "Serviço gerenciado", "Sessão e credenciais", tsize=17)
s.box("ext", 1040, 650, 300, 150, "Cloud Firestore", "NoSQL", "Coleções usuarios e eventos", tsize=17, db=True)
s.arrow([(360, 260), (205, 370)], ["Se não há sessão"], (275, 312))
s.arrow([(470, 260), (495, 370)], ["Se perfil = atletica"], (505, 312))
s.arrow([(580, 260), (785, 370)], ["Se perfil = estudante"], (700, 312))
s.arrow([(205, 510), (420, 660)], ["Usa"], (290, 575))
s.arrow([(495, 510), (495, 660)], ["Usa"], (495, 585))
s.arrow([(785, 510), (570, 660)], ["Usa"], (700, 575))
s.arrow([(290, 200), (55, 200), (55, 725), (370, 725)], ["Usa"], (55, 450))
s.arrow([(620, 700), (1040, 520)], ["Autentica"], (830, 610))
s.arrow([(620, 750), (1040, 735)], ["Lê e grava"], (830, 738))
s.save(f"{OUT}/c3-componentes.svg")

with sync_playwright() as p:
    b = p.chromium.launch()
    for name, (w, h) in {"c1-contexto": (1200, 780), "c2-conteineres": (1360, 880), "c3-componentes": (1380, 920)}.items():
        pg = b.new_page(viewport={"width": w, "height": h}, device_scale_factor=2)
        pg.goto(f"file://{OUT}/{name}.svg")
        pg.screenshot(path=f"{OUT}/{name}.png")
        pg.close()
    b.close()
print("feito")
