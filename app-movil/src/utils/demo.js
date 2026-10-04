let modoDemo = false;

export function activarDemo(valor) {
  modoDemo = valor;
}

export function esDemo() {
  return modoDemo;
}