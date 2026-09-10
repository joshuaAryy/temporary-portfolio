// Material adapted from React Bits Metallic Paint (b6a5c9589).
// The accompanying metal.LICENSE.md retains its copyright and license.
import fragment from './metal.frag?raw';
import surfaceUrl from './assets/signature-surface.png';

const vertex = `#version 300 es
in vec2 a_position;
out vec2 vP;
void main(){vP=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;

export interface Metal {
  draw: (time: number, x: number, y: number, impulse: number) => void;
  dispose: () => void;
}

export async function createMetal(canvas: HTMLCanvasElement): Promise<Metal | null> {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  let disposed = false;
  const dispose = () => {
    disposed = true;
    delete canvas.dataset.ready;
    gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    shaders.forEach(s => gl.deleteShader(s));
  };
  try {
    if (!program || !buffer || !texture) throw new Error('Graphics unavailable');
    for (const [source, type] of [[vertex, gl.VERTEX_SHADER], [fragment, gl.FRAGMENT_SHADER]] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Graphics unavailable');
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Shader unavailable');
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Material unavailable');
    const img = new Image();
    img.src = surfaceUrl;
    await img.decode();
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniform = (name: string) => gl.getUniformLocation(program, name);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.uniform1i(uniform('u_tex'), 0);
    gl.uniform1f(uniform('u_imgRatio'), img.width / img.height);
    const timeUniform = uniform('u_time');
    const pointerUniform = uniform('u_pointer');
    const liquidUniform = uniform('u_liquid');
    const ratioUniform = uniform('u_ratio');
    return {
      draw(time, x, y, impulse) {
        if (disposed || gl.isContextLost()) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.round(canvas.clientWidth * dpr);
        const height = Math.round(canvas.clientHeight * dpr);
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          gl.viewport(0, 0, width, height);
          gl.uniform1f(ratioUniform, width / height);
        }
        gl.uniform1f(timeUniform, time);
        gl.uniform2f(pointerUniform, x, y);
        gl.uniform1f(liquidUniform, .12 + impulse * .08);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        canvas.dataset.ready = 'true';
      },
      dispose,
    };
  } catch {
    dispose();
    return null;
  }
}
