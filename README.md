# Mediana de Dois Bancos de Dados

**Experimento 6.10 — Divisão e Conquista · Análise de Algoritmos**

Dois institutos entregam listas ordenadas de salários. O objetivo é calcular a **mediana combinada** das duas listas de forma eficiente, comparando experimentalmente dois algoritmos com complexidades muito diferentes.

---

## Algoritmos Comparados

| Algoritmo | Estratégia | Complexidade |
|---|---|---|
| Juntar + Ordenar | Concatena e ordena os dois vetores | O(n log n) |
| Divisão e Conquista | Busca binária pelo particionamento correto | O(log n) |

---

## Como Executar

### Desenvolvimento

```bash
npm install
npm run dev
# Acesse http://localhost:5173
```

### Docker

```bash
docker compose up --build
# Acesse http://localhost:8080
```

### Gerar arquivos de entrada antecipadamente (opcional)

```bash
npm run generate-inputs
# Cria public/data/inputs/input_n1000_r10.json ... input_n100000_r10.json
```

> Os arquivos também são gerados automaticamente na **primeira execução** do experimento no app, via `npm run dev`. Execuções seguintes com os mesmos parâmetros reutilizam os arquivos existentes — medianas estáveis e geração de pares ignorada.

---

## Estrutura do Projeto

```
MedianOfTwoDatabases/
├── Dockerfile                          # Build multi-stage: Node → nginx
├── docker-compose.yml                  # Serve na porta 8080
├── nginx.conf                          # Configuração SPA para nginx
├── vite.config.ts                      # Build + middleware /api/save-inputs
│
├── scripts/
│   └── generateInputs.ts               # Script Node.js: gera JSONs em disco
│
├── public/
│   └── data/inputs/                    # JSONs gerados (não commitados)
│       ├── input_n1000_r10.json
│       ├── input_n2000_r10.json
│       └── ...
│
└── src/
    ├── algorithms/
    │   ├── mergeSortMedian.ts          # Algoritmo 1: O(n log n)
    │   └── divideConquerMedian.ts      # Algoritmo 2: O(log n)
    │
    ├── experiment/
    │   ├── types.ts                    # Interfaces TypeScript compartilhadas
    │   ├── inputGenerator.ts           # Geração de pares de vetores ordenados
    │   └── timer.ts                    # Medição adaptativa de tempo
    │
    ├── workers/
    │   └── experiment.worker.ts        # Web Worker: orquestra o experimento completo
    │
    └── components/
        ├── ExperimentControls.vue      # Painel de controle (nMin, nMax, reps)
        ├── ProgressBar.vue             # Barra de progresso em tempo real
        ├── ComparisonChart.vue         # Gráfico Chart.js: tempo vs n (tooltip com mediana)
        ├── VerificationTable.vue       # Tabela de verificação de corretude e medianas
        ├── DiscussionSection.vue       # Análise automática dos resultados
        └── ExportPanel.vue             # Download de input_n{X}_r{reps}.json (pares salvos)
```

---

## Os Algoritmos

### Algoritmo 1 — Juntar e Ordenar — O(n log n)

```typescript
// src/algorithms/mergeSortMedian.ts
export function mergeSortMedian(a: number[], b: number[]): number {
  const merged = [...a, ...b].sort((x, y) => x - y)
  const n = merged.length
  if (n % 2 !== 0) return merged[Math.floor(n / 2)]
  return (merged[n / 2 - 1] + merged[n / 2]) / 2
}
```

**Como funciona:**
1. `[...a, ...b]` — concatena os dois vetores em um novo array de tamanho 2n
2. `.sort((x, y) => x - y)` — ordena todos os 2n elementos (custo dominante: O(n log n))
3. Se o total é ímpar, retorna o elemento do meio; se par, retorna a média dos dois centrais

**Desvantagem:** mesmo que A e B já estejam ordenados, o algoritmo ignora essa informação e ordena tudo do zero.

---

### Algoritmo 2 — Divisão e Conquista — O(log n)

```typescript
// src/algorithms/divideConquerMedian.ts
export function divideConquerMedian(a: number[], b: number[]): number {
  if (a.length > b.length) return divideConquerMedian(b, a)  // garante que A é o menor

  const m = a.length
  const n = b.length
  let lo = 0
  let hi = m

  while (lo <= hi) {
    const pA = (lo + hi) >> 1                    // partição de A (busca binária)
    const pB = ((m + n + 1) >> 1) - pA           // partição de B (determinada por pA)

    const maxLA = pA === 0 ? -Infinity : a[pA - 1]   // maior elem. à esquerda de A
    const minRA = pA === m ?  Infinity : a[pA]        // menor elem. à direita de A
    const maxLB = pB === 0 ? -Infinity : b[pB - 1]   // maior elem. à esquerda de B
    const minRB = pB === n ?  Infinity : b[pB]        // menor elem. à direita de B

    if (maxLA <= minRB && maxLB <= minRA) {
      // partição correta encontrada
      const maxLeft = Math.max(maxLA, maxLB)
      if ((m + n) % 2 !== 0) return maxLeft              // total ímpar: retorna o maior da esquerda
      return (maxLeft + Math.min(minRA, minRB)) / 2      // total par: média dos dois centrais
    } else if (maxLA > minRB) {
      hi = pA - 1   // pA está muito à direita, recua
    } else {
      lo = pA + 1   // pA está muito à esquerda, avança
    }
  }

  throw new Error('Arrays inválidos: devem estar ordenados')
}
```

**A ideia central:**

Imagine que a união dos dois vetores, quando ordenada, tem um **ponto de corte** que divide os elementos em metade esquerda e metade direita. A mediana é determinada por esses elementos centrais.

Em vez de montar a lista completa, procuramos esse ponto de corte fazendo busca binária sobre **apenas um dos vetores** (o menor). Para cada posição `pA` de corte em A, a posição `pB` em B é determinada automaticamente (a metade esquerda precisa ter exatamente `⌈(m+n+1)/2⌉` elementos).

O particionamento é **correto** quando:
```
max(esquerda_A, esquerda_B) ≤ min(direita_A, direita_B)
```

---

## Exemplo Prático Detalhado

### Entrada

```
A = [1, 3, 8, 12]     (salários do Instituto A, ordenados)
B = [2, 5, 9, 15]     (salários do Instituto B, ordenados)
m = 4, n = 4
```

---

### Algoritmo 1 — Juntar e Ordenar

```
Passo 1 — concatenar:
  [1, 3, 8, 12, 2, 5, 9, 15]

Passo 2 — ordenar:
  [1, 2, 3, 5, 8, 9, 12, 15]
   0  1  2  3  4  5   6   7    ← índices

Passo 3 — encontrar mediana:
  Total = 8 elementos (par)
  Mediana = (merged[3] + merged[4]) / 2
          = (5 + 8) / 2
          = 6.5
```

---

### Algoritmo 2 — Divisão e Conquista (passo a passo)

**Estado inicial:** `lo = 0, hi = 4`

#### Iteração 1

```
pA = (lo + hi) >> 1 = (0 + 4) >> 1 = 2

Partição de A em pA=2:
  esquerda_A = [1, 3]  |  direita_A = [8, 12]

pB = ((4 + 4 + 1) >> 1) - pA = 4 - 2 = 2

Partição de B em pB=2:
  esquerda_B = [2, 5]  |  direita_B = [9, 15]

Visualização:
  A: [  1   3  ] | [  8  12  ]
  B: [  2   5  ] | [  9  15  ]
                 ↑
           ponto de corte

maxLA = a[pA-1] = a[1] = 3     (maior à esquerda de A)
minRA = a[pA]   = a[2] = 8     (menor à direita de A)
maxLB = b[pB-1] = b[1] = 5     (maior à esquerda de B)
minRB = b[pB]   = b[2] = 9     (menor à direita de B)

Verificação do invariante:
  maxLA (3) ≤ minRB (9)  ✓  ← nenhum elem. da esq_A invade a dir_B
  maxLB (5) ≤ minRA (8)  ✓  ← nenhum elem. da esq_B invade a dir_A

✓ Partição correta encontrada na 1ª iteração!

Total par (m+n=8):
  maxLeft  = max(maxLA, maxLB) = max(3, 5) = 5
  minRight = min(minRA, minRB) = min(8, 9) = 8
  Mediana  = (5 + 8) / 2 = 6.5  ✓
```

Ambos os algoritmos chegam ao mesmo resultado: **6.5**.

---

### Exemplo com 2 iterações (busca binária se ajusta)

```
A = [10, 20, 30, 40]    B = [1, 2, 3, 4]
m = 4, n = 4,  lo = 0, hi = 4
```

#### Iteração 1

```
pA = 2  →  esq_A = [10, 20]  |  dir_A = [30, 40]
pB = 2  →  esq_B = [ 1,  2]  |  dir_B = [ 3,  4]

maxLA = 20,  minRA = 30
maxLB =  2,  minRB =  3

Verificação: maxLA(20) ≤ minRB(3)?  ✗  (20 > 3)
→ pA está muito à direita; hi = pA - 1 = 1
```

#### Iteração 2

```
lo = 0, hi = 1
pA = (0+1) >> 1 = 0  →  esq_A = []       |  dir_A = [10, 20, 30, 40]
pB = 4 - 0 = 4       →  esq_B = [1,2,3,4]|  dir_B = []

maxLA = -∞  (pA=0, nada à esquerda de A)
minRA = a[0] = 10
maxLB = b[3] = 4
minRB = +∞  (pB=n, nada à direita de B)

Verificação:
  maxLA(-∞) ≤ minRB(+∞)  ✓
  maxLB (4) ≤ minRA (10)  ✓

✓ Partição correta!

maxLeft  = max(-∞, 4) = 4
minRight = min(10, +∞) = 10
Mediana  = (4 + 10) / 2 = 7
```

**Verificação:** União ordenada = [1, 2, 3, 4, 10, 20, 30, 40] → mediana = (4+10)/2 = **7** ✓

Mesmo com os vetores completamente separados (todos os de B menores que todos os de A), o algoritmo encontra a resposta em apenas **2 iterações**.

---

## Metodologia Experimental

O experimento segue as diretrizes do professor:

| Parâmetro | Valor padrão | Configurável |
|---|---|---|
| n mínimo | 1.000 (10³) | Sim — mín 100 |
| n máximo | 100.000 (10⁵) | Sim — máx 1.000.000 |
| Tamanhos testados | 100 (igualmente espaçados) | Não |
| Repetições por tamanho | 10 | Sim |

**Para cada tamanho n:**

1. Carregar (ou gerar) `reps` pares distintos de vetores aleatórios ordenados `(A, B)`, cada um com n elementos
2. Para cada par, executar ambos os algoritmos e verificar que retornam o mesmo resultado (`|naive - dc| < 1e-9`)
3. Medir o tempo de cada algoritmo com **loop adaptativo** (ver seção abaixo)
4. Calcular média e desvio padrão dos tempos
5. Um ponto `(n, tempo_médio)` é adicionado ao gráfico

O gráfico final tem 100 pontos por algoritmo, formando duas curvas que evidenciam a diferença de crescimento entre O(n log n) e O(log n).

---

## Fluxo Completo da Aplicação

```
Usuário define: nMin, nMax, repetições
        ↓
[ExperimentControls.vue] emite evento 'start'
        ↓
[App.vue] cria um Web Worker
        ↓
[experiment.worker.ts] recebe { nMin, nMax, reps }
  │
  ├─ computeSizeRange(nMin, nMax, 100)
  │    └ 100 valores de n igualmente espaçados
  │
  └─ para cada n:
       │
       ├─ loadOrGeneratePairs(n, reps)
       │    ├─ tenta GET /data/inputs/input_n{n}_r{reps}.json
       │    ├─ se existir → reutiliza os pares salvos
       │    │    └ (2ª rodada: mais rápido, medianas estáveis)
       │    └─ se não existir → generateInputBatch(n, reps)
       │         └─ POST /api/save-inputs (apenas em dev, fire-and-forget)
       │              └ salva public/data/inputs/input_n{n}_r{reps}.json
       │
       ├─ para cada par (A, B):
       │    ├─ corretude: naive(A,B) === dc(A,B)?
       │    ├─ measureMs(() => mergeSortMedian(A, B))
       │    └─ measureMs(() => divideConquerMedian(A, B))
       │
       ├─ calcula: média + desvio padrão dos tempos
       │
       └─ postMessage { type: 'progress', percent, currentN }
  │
  └─ postMessage { type: 'done', results: SizeResult[] }
        ↓
[App.vue] recebe resultados e atualiza estado reativo
        ↓
[ComparisonChart.vue]    → gráfico Chart.js: tempo (ms) vs n + tooltip com mediana por algoritmo
[VerificationTable.vue]  → tabela: medianas de cada algoritmo, corretude, tempos
[DiscussionSection.vue]  → speedup máximo, ponto de cruzamento
[ExportPanel.vue]        → baixa input_n{X}_r{reps}.json (pares exatos usados no experimento)
```

---

## Medição de Tempo: Por Que Não `performance.now()` Simples?

O algoritmo de divisão e conquista para n = 100.000 executa apenas ~17 comparações, levando cerca de **1–5 microssegundos**. O problema: navegadores limitam a resolução de `performance.now()` a **0,1 ms (100 µs)** por razões de segurança (mitigação de ataques Spectre). Qualquer operação mais rápida que isso aparece como `0 ms`.

**Solução — loop adaptativo com warmup:**

```typescript
// src/experiment/timer.ts
const MIN_DURATION_MS = 10

export function measureMs(fn: () => void): number {
  fn()  // warmup: descarta a 1ª chamada (JIT ainda "frio")

  let iterations = 0
  const start = performance.now()
  do {
    fn()
    iterations++
  } while (performance.now() - start < MIN_DURATION_MS)

  return (performance.now() - start) / iterations
}
```

O loop roda a função até acumular pelo menos 10 ms de execução, depois divide o tempo total pelo número de iterações. O resultado é o **tempo médio por chamada** com precisão muito maior:

| Algoritmo | n = 100.000 | Iterações no loop | Tempo medido |
|---|---|---|---|
| Naive O(n log n) | ~80ms por chamada | 1 (já passou de 10ms) | ~80ms ✓ |
| DC O(log n) | ~0.002ms por chamada | ~5.000 | ~0.002ms ✓ |

---

## Arquivos de Entrada (`public/data/inputs/`)

### Formato

```json
{
  "n": 5000,
  "reps": 10,
  "pairs": [
    {
      "a": [142, 891, 1205, 3401, ...],
      "b": [307, 654, 2190, 4882, ...]
    },
    {
      "a": [88, 234, 778, ...],
      "b": [411, 990, 1340, ...]
    }
  ]
}
```

- `n` — tamanho de cada vetor
- `reps` — número de pares; garante consistência entre o que foi executado e o que é exportado
- `pairs` — lista com `reps` pares; cada par tem dois vetores ordenados de inteiros entre 0 e 999.999

### Quando são criados

- **1ª execução** com um conjunto de parâmetros (nMin, nMax, reps): gerados e salvos automaticamente no app (`npm run dev`)
- **2ª execução** com os mesmos parâmetros: lidos do disco — medianas estáveis entre rodadas, geração de pares ignorada
- O nome do arquivo codifica `n` e `reps` (ex: `input_n5000_r10.json`), então mudar `reps` cria um novo conjunto de arquivos sem sobrescrever os anteriores
- **Manualmente** a qualquer momento via `npm run generate-inputs` (padrão: nMin=1000, nMax=100000, reps=10)
- Para forçar regeneração: delete a pasta `public/data/inputs/`

### Como inspecionar

```bash
# Arquivos pequenos são fáceis de abrir (n ≤ 10.000)
code public/data/inputs/input_n1000_r10.json

# Arquivos grandes (n > 50.000) têm 10–20 MB — use head para ver a estrutura
```

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Vue 3 + Composition API | Framework frontend |
| TypeScript | Tipagem estática em todo o projeto |
| Vite | Build tool + middleware de dev para salvar JSONs |
| Chart.js + vue-chartjs | Gráfico de linhas interativo com tooltip customizado |
| Tailwind CSS v4 | Estilização utilitária (Apple HIG) |
| Web Workers API | Experimento em thread separada (UI não trava) |
| Docker + nginx | Containerização e serve do build estático |
