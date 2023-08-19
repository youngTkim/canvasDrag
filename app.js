import { Point } from "./point.js";
import { Dialog } from "./dialog.js";

class App {
  constructor() {
    // canvas, context 설정 후 body 안에 추가
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    // 기기의 pixelRatio설정에 따라 캔버스 스캐일 비율을 조절
    this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;

    // 현재 마우스 포인터의 위치
    this.mousePos = new Point();
    this.curItem = null;

    // 각 물체의 속성을 담고 있는 Dialog들을 담는 곳
    this.items = [];
    // Dialog의 숫자
    this.total = 3;
    // total 수만큼 Dialog를 생성
    for (let i = 0; i < this.total; i++) {
      this.items[i] = new Dialog();
    }

    // 기기 사이즈에 맞게 resize
    window.addEventListener("resize", this.resize.bind(this), false);
    this.resize();

    // 포인터를 누르고 움직이고 뗄 때 구현될 애니메이션을 위해 event연결
    document.addEventListener("pointerdown", this.onDown.bind(this), false);
    document.addEventListener("pointermove", this.onMove.bind(this), false);
    document.addEventListener("pointerup", this.onUp.bind(this), false);

    // 애니메이팅 시작
    window.requestAnimationFrame(this.animate.bind(this));
  }

  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.canvas.width = this.stageWidth * this.pixelRatio;
    this.canvas.height = this.stageHeight * this.pixelRatio;

    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    // 기본 그림자 설정
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 3;
    this.ctx.shadowBlur = 6;
    this.ctx.shadowColor = `rgba(0,0,0,0.5)`;

    this.ctx.lineWidth = 2;

    // 생성될 컨텐츠들도 stageWidth, stageHeight에 맞게 조절
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].resize(this.stageWidth, this.stageHeight);
    }
  }
  animate() {
    this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].animate(this.ctx);
    }

    if (this.curItem) {
      this.ctx.fillStyle = `#ff4338`;
      this.ctx.strokeStyle = `#ff4338`;

      this.ctx.beginPath();
      this.ctx.arc(this.mousePos.x, this.mousePos.y, 8, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(
        this.curItem.centerPos.x,
        this.curItem.centerPos.y,
        8,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.moveTo(this.mousePos.x, this.mousePos.y);
      this.ctx.lineTo(this.curItem.centerPos.x, this.curItem.centerPos.y);
      this.ctx.stroke();
    }
    window.requestAnimationFrame(this.animate.bind(this));
  }
  onDown(e) {
    // point 인스턴스의 x, y 좌표를 이벤트가 일어난 좌표로 설정
    this.mousePos.x = e.clientX;
    this.mousePos.y = e.clientY;

    // shift보다 push의 시간복잡도가 낮으므로 push를 통해 this.items배열의 가장 마지막 원소를 splice해서 push를 한다.
    // i는 마지막 인덱스부터 0까지 순회하기 때문에 클릭된 Dialog는 화면 가장 먼저 앞으로 오게 되고,
    // break를 통해서 클릭된 하나의 item을 컨트롤하게 된다.
    for (let i = this.items.length - 1; i >= 0; i--) {
      // 렌더링할 때 this.items배열을 0부터 length-1까지 순회하기 때문에 canvas에서 가장 앞쪽처럼 보이는 Dialog는 가장 마지막 원소다.
      // 그래서 거꾸로 배열을 순회하고 마우스 클릭을 했을 때의 x,y 좌표를 down메소드를 통해 지정된 item이 있나 확인 가장 첫번째로 확인되는 curItem으로 지정한다.
      const item = this.items[i].down(this.mousePos.clone());
      if (item) {
        this.curItem = item;
        const index = this.items.indexOf(item);
        this.items.push(this.items.splice(index, 1)[0]);
        break;
      }
    }
  }
  onMove(e) {
    this.mousePos.x = e.clientX;
    this.mousePos.y = e.clientY;
    this.items[this.items.length - 1].move(this.mousePos.clone());
  }
  // for (let i = 0; i < this.items.length; i++) {
  //   this.items[i].move(this.mousePos.clone());
  // }
  onUp() {
    this.curItem = null;

    this.items[this.items.length - 1].up();
  }
  // for (let i = 0; i < this.items.length; i++) {
  //   this.items[i].up();
  // }
}

window.onload = () => {
  new App();
};
