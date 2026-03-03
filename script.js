const atributos = document.querySelectorAll(".card");

const raio = 220;
const total = atributos.length;

atributos.forEach((atributo, index) => {
  const angulo = (index / total) * (2 * Math.PI);

  const x = Math.cos(angulo) * raio;
  const y = Math.sin(angulo) * raio;

  atributo.style.position = "absolute";
  atributo.style.left = "50%";
  atributo.style.top = "50%";

  atributo.style.transform = `
    translate(-50%, -50%)
    translate(${x}px, ${y}px)
  `;
});
