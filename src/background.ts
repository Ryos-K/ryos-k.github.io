import p5 from 'p5';

function sketch(p: p5) {
  p.setup = () => {
    const canvas = p.createCanvas(400, 400);
    canvas.position(0, 0);
    canvas.style("z-index", "-1");
  };

  p.draw = () => {
    p.background(33);
  };
}

new p5(sketch);