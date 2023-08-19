import { Point } from "./point.js";

const FOLLOW_SPEED = 0.08;
const ROTATE_SPEED = 0.12;
const SPEED_REDUCE = 0.8;
const MAX_ANGLE = 45;
const FPS = 1000 / 60;
const WIDTH = 260;
const HEIGHT = 260;

export class Dialog {
  constructor() {
    this.pos = new Point();
    this.target = new Point();
    this.prevPos = new Point();
    this.downPos = new Point();
    this.speedPos = new Point();
    this.startPos = new Point();
    this.mousePos = new Point();
    this.centerPos = new Point();
    this.origin = new Point();
    this.rotation = 0;
    this.sideValue = 0;
    this.isDown = false;
  }
  resize(stageWidth, stageHeight) {
    // 내용물을 stageWidth - WIDTH 안으로 stageHeight - HEIGHT으로 설정, 사각형을 현재의 화면 안에서 다시 랜덤하게 생성
    this.pos.x = Math.random() * (stageWidth - WIDTH);
    this.pos.y = Math.random() * (stageHeight - HEIGHT);
    this.target = this.pos.clone();
    this.prevPos = this.pos.clone();
  }
  animate(ctx) {
    // 현재 위치에서 target 위치로 이동하는데 사용될 이동 벡터를 계산
    const move = this.target.clone().subtract(this.pos).reduce(FOLLOW_SPEED);
    this.pos.add(move);

    this.centerPos = this.pos.clone().add(this.mousePos);

    this.swingDrag(ctx);

    this.prevPos = this.pos.clone();
  }

  swingDrag(ctx) {
    const dx = this.pos.x - this.prevPos.x;
    const speedX = Math.abs(dx) / FPS;
    const speed = Math.min(Math.max(speedX, 0), 1);

    let rotation = (MAX_ANGLE / 1) * speed;
    rotation = rotation * (dx > 0 ? 1 : -1) - this.sideValue;

    this.rotation += (rotation - this.rotation) * ROTATE_SPEED;
    const tmpPos = this.pos.clone().add(this.origin);

    ctx.save();
    ctx.translate(tmpPos.x, tmpPos.y);
    ctx.rotate((2 * this.rotation * Math.PI) / 360);
    ctx.beginPath();
    ctx.fillStyle = `#f4e55a`;
    ctx.fillRect(-this.origin.x, -this.origin.y, WIDTH, HEIGHT);
    ctx.restore();
  }
  down(point = "현재 마우스 위치를 x,y 좌표를 clone") {
    // 포인트가 화면안에 있을 시에 (collide는 화면 안에 사각형이 들어와있는지를 반환)
    if (point.collide(this.pos, WIDTH, HEIGHT)) {
      // isDown = true
      this.isDown = true;
      // 현재 물체가 있는 위치를 드래그 시작 위치로 설정
      this.startPos = this.pos.clone();
      // 드래그 시작 위치의 클릭 시의 위치를 설정
      this.downPos = point.clone();

      // 드래그 시작 시의 클릭 지점과 다이얼로그 위치의 차이를 계산하여 this.mousePos에 저장
      this.mousePos = point.clone().subtract(this.pos);
      // console.log(this.downPos, this.startPos);

      // 클릭 지점의 x 좌표를 다이얼로그의 너비(WIDTH)로 나눈 비율을 계산
      const xRatioValue = this.mousePos.x / WIDTH;

      this.origin.x = WIDTH * xRatioValue;
      this.origin.y = (HEIGHT * this.mousePos.y) / HEIGHT;

      this.sideValue = xRatioValue - 0.5;

      return this;
    } else {
      return null;
    }
  }

  move(point = "현재 마우스 위치를 x,y 좌표를 clone") {
    if (this.isDown) {
      // pointerdown 상태일 때 마우스 포인터가 this.startPos에서 드래그를 시작할 때에 클릭이 시작된 위치 부터
      // .add(point).subtract(this.downPos) 지금 마우스 좌표가 움직이고 있는 x,y좌표에 처음 드래그가 시작된 위치의 좌표값을 뺀다.
      // 드래그 시작 위치부터 마우스 위치만큼 target을 계속적으로 이동시킨다.
      this.target = this.startPos.clone().add(point).subtract(this.downPos);
    }
  }

  up() {
    this.isDown = false;
  }
}
