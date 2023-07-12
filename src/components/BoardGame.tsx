import React, { useRef, useEffect, useState } from "react";
import classes from "./BoardGame.module.css";
import { CellValue } from "../constant/enum";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  changeTurn,
  removeStorage,
  resetBoard,
  selectBoard,
  decrementStep,
  incrementStep,
  writeToStorage,
} from "../features/board/boardSlice";
import { textColorMapper, tileSize } from "../constant";
import {
  selectStatistic,
  updateIfWin,
} from "../features/statistic/statisticSlice";
import {
  formatNumber,
  getPrimitiveStorage,
  handleClickExport,
} from "../helpers";

export const highlightWinningCells = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  winningCells: number[][]
) => {
  const canvas = canvasRef.current;
  const context = canvas?.getContext("2d");

  if (!context || !canvas || !winningCells.length) return;

  for (let i = 0; i < winningCells.length; i++) {
    context.fillStyle = "yellow";
    context.fillRect(
      winningCells[i][0] * tileSize,
      winningCells[i][1] * tileSize,
      tileSize,
      tileSize
    );
  }
};

export const drawBoard = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  blocks: React.MutableRefObject<[number, number, CellValue][]>,
  offset: React.MutableRefObject<{
    x: number;
    y: number;
  }>,
  winningCells: [number, number][]
) => {
  if (canvasRef.current) {
    let ctx = canvasRef.current.getContext("2d");

    let left = 0.5 - Math.ceil(canvasRef.current.width / tileSize) * tileSize;
    let top = 0.5 - Math.ceil(canvasRef.current.height / tileSize) * tileSize;
    let right = 2 * canvasRef.current.width;
    let bottom = 2 * canvasRef.current.height;

    if (ctx) {
      ctx.clearRect(left, top, right - left, bottom - top);
      ctx.beginPath();
      for (let x = left; x < right; x += tileSize) {
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
      }
      for (let y = top; y < bottom; y += tileSize) {
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
      }
      ctx.strokeStyle = "#888";
      ctx.stroke();

      if (winningCells.length) {
        for (let i = 0; i < winningCells.length; i++) {
          ctx.fillStyle = "yellow";
          ctx.fillRect(
            winningCells[i][0] * tileSize + offset.current.x,
            winningCells[i][1] * tileSize + offset.current.y,
            tileSize,
            tileSize
          );
        }
      }

      // Draw blocks
      for (const [x, y, value] of blocks.current) {
        if (value) {
          ctx.font = "20px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = textColorMapper[value];

          ctx.fillText(
            value,
            x * tileSize + offset.current.x + tileSize / 2,
            y * tileSize + offset.current.y + tileSize / 2
          );
        }
      }
    }
  }
};

export const checkWin = (
  row: number,
  col: number,
  blocks: React.MutableRefObject<[number, number, CellValue][]>,
  currentPlayer: CellValue
): number[][] | null => {
  const directions = [
    [1, 0], // Horizontal
    [0, 1], // Vertical
    [1, 1], // Diagonal \
    [-1, 1], // Diagonal /
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    let tempCells: number[][] = [[row, col]];

    // Check in both directions
    for (let i = 1; i <= 4; i++) {
      const newRow = row + i * dx;
      const newCol = col + i * dy;

      const existed = blocks.current.findIndex(
        (b) => b[0] === newRow && b[1] === newCol
      );

      if (existed !== -1 && blocks.current[existed][2] === currentPlayer) {
        count++;
        tempCells.push([newRow, newCol]);
      } else {
        break;
      }
    }

    for (let i = 1; i <= 4; i++) {
      const newRow = row - i * dx;
      const newCol = col - i * dy;

      const existed = blocks.current.findIndex(
        (b) => b[0] === newRow && b[1] === newCol
      );

      if (existed !== -1 && blocks.current[existed][2] === currentPlayer) {
        count++;
        tempCells.push([newRow, newCol]);
      } else {
        break;
      }
    }

    if (count >= 5) {
      return tempCells;
    }
  }

  return null;
};

const BoardGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { xTurn, steps } = useAppSelector(selectBoard);
  const { numberOfGames, totalStep, xWin } = useAppSelector(selectStatistic);
  const dispatch = useAppDispatch();

  const [nextStep, setNextStep] = useState<[number, number, CellValue][]>([]); // store next step to redo
  const [dialogOpen, setDialogOpen] = useState(false); // dialog open when someone win
  const [isSomeoneWinned, setIsSomeoneWinned] = useState(false);
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const start = useRef<{ x: number; y: number } | null>();
  const blocks = useRef<[number, number, CellValue][]>(
    getPrimitiveStorage("blocks", [])
  );
  const offset = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth / 2;
      canvasRef.current.height = window.innerHeight / 2;
    }
  }, []);

  useEffect(() => {
    drawBoard(canvasRef, blocks, offset, winningCells);

    if (!blocks.current.length) return;

    dispatch(writeToStorage(blocks.current));

    const [row, col, value] = blocks.current[blocks.current.length - 1];

    const wCells = checkWin(row, col, blocks, value);

    if (wCells) {
      setWinningCells(wCells as [number, number][]);

      dispatch(updateIfWin({ xWin: xTurn ? false : true, totalStep: steps }));
      dispatch(removeStorage());

      setIsSomeoneWinned(true);
      handleUpdateDiaglog(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, offset, start, dispatch, steps, xTurn]);

  const handleClickUndo = () => {
    if (blocks.current.length) {
      dispatch(decrementStep());
      dispatch(changeTurn());

      const lastBlock = blocks.current.pop();
      setNextStep((prev) => [...prev, lastBlock!]);
    }
  };

  const handleClickRedo = () => {
    if (nextStep.length) {
      const lastBlock = nextStep[nextStep.length - 1];
      dispatch(incrementStep());
      dispatch(changeTurn());

      blocks.current.push(lastBlock);
      setNextStep((prev) => [...prev.slice(0, prev.length - 1)]);
    }
  };

  const handleClickReset = () => {
    dispatch(removeStorage());
    dispatch(resetBoard());
    setIsSomeoneWinned(false);
    setWinningCells([]);

    blocks.current = [];
    offset.current = { x: 0, y: 0 };
    start.current = null;

    drawBoard(canvasRef, blocks, offset, winningCells);
  };

  const handleUpdateDiaglog = (open: boolean) => {
    setDialogOpen(open);
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (canvasRef.current) {
      return {
        x: e.clientX - canvasRef.current.offsetLeft,
        y: e.clientY - canvasRef.current.offsetTop,
      };
    }

    return null;
  };

  const reset = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
      start.current = null;
      ctx?.setTransform(1, 0, 0, 1, 0, 0); // reset translation
      drawBoard(canvasRef, blocks, offset, winningCells);
    }
  };

  const onMouseDown = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    reset();
    start.current = getPos(event);
  };

  const onMouseUp = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (isSomeoneWinned) {
      handleClickReset();
      return;
    }

    let pos = getPos(event);

    if (canvasRef.current) {
      let ctx = canvasRef.current.getContext("2d");

      if (ctx && pos) {
        const t = ctx.getTransform();
        if (t.e === 0 && t.f === 0) {
          const row = Math.floor((pos.x - offset.current.x) / tileSize);
          const col = Math.floor((pos.y - offset.current.y) / tileSize);

          const existedCell = blocks.current.findIndex(
            (b) => (b[0] as number) === row && b[1] === col
          );

          if (existedCell === -1) {
            const block = [row, col, xTurn ? CellValue.X : CellValue.O];

            blocks.current.push(block as [number, number, CellValue]);
            dispatch(changeTurn());
            dispatch(incrementStep());
            setNextStep([]);
          }
        } else {
          offset.current.x += Math.floor(t.e / tileSize) * tileSize;
          offset.current.y += Math.floor(t.f / tileSize) * tileSize;
        }

        reset();
      }
    }
  };

  const onMouseLeave = () => reset();

  const onMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    // Only move the grid when we registered a mousedown event
    if (!start.current) return;
    let pos = getPos(event);

    // Move coordinate system in the same way as the cursor
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx && pos && start.current) {
      ctx.translate(pos.x - start.current.x, pos.y - start.current.y);
      drawBoard(canvasRef, blocks, offset, winningCells);
      start.current = pos;
    }
  };

  return (
    <div className={classes.container}>
      <canvas
        ref={canvasRef}
        id="myCanvas"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      />
      <div className={classes.right}>
        TURN: Player {xTurn ? "X" : "O"}
        <br />
        Steps: {steps}
        <button onClick={handleClickReset}>Reset</button>
        <button disabled={!blocks.current.length} onClick={handleClickUndo}>
          Undo
        </button>
        <button disabled={!nextStep.length} onClick={handleClickRedo}>
          Redo
        </button>
        <button onClick={handleClickExport}>Export PNG</button>
        <div className={classes.statistic}>
          <div className={classes.item}>Number Of Games: {numberOfGames}</div>
          <div className={classes.item}>
            Win rate of X:{" "}
            {numberOfGames === 0
              ? 0
              : formatNumber((xWin * 100) / numberOfGames)}
            %
          </div>
          <div className={classes.item}>
            Win rate of Y:{" "}
            {numberOfGames === 0
              ? 0
              : formatNumber(100 - (xWin * 100) / numberOfGames)}
            %
          </div>
          <div className={classes.item}>
            Average steps of each game:{" "}
            {numberOfGames === 0 ? 0 : formatNumber(totalStep / numberOfGames)}
          </div>
        </div>
      </div>

      <div>
        <div className={dialogOpen ? classes.overlay : ""}></div>
        <dialog open={dialogOpen} className={classes.diaglog}>
          <p>Greetings, Player {xTurn ? "O" : "X"} Winned!</p>
          <form method="dialog">
            <button onClick={() => handleUpdateDiaglog(false)}>OK</button>
          </form>
        </dialog>
      </div>
    </div>
  );
};

export default BoardGame;
