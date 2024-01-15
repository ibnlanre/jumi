import {
  act,
  render,
  renderHook,
  fireEvent,
  screen,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";

import { signal } from "@/signal";
import { ComponentProps } from "react";

interface NumberDisplayProps extends ComponentProps<"button"> {
  count: number;
  onClick?: () => void;
}

const NumberDisplay = ({ count, onClick }: NumberDisplayProps) => {
  return (
    <button data-testid="number-display" onClick={onClick}>
      {count}
    </button>
  );
};

describe("signal", () => {
  it("should create a signal object with correct nested structure", () => {
    const number = signal(1);
    const computed = signal(() => number.value * 3);

    expect(number.value).toEqual(1);
    expect(computed).toEqual(3);
  });

  it("should compute the correct value", () => {
    const number = signal(1);
    const computed = signal(() => number.value * 3);

    const { result: numberHook, rerender } = renderHook(() => number.use());
    const [numberValue, setNumberValue] = numberHook.current;
    expect(numberValue).toEqual(1);

    const { result: computedHook } = renderHook(() => computed.use());
    expect(computedHook.current[0]).toEqual(3);

    act(() => {
      setNumberValue(2);
      rerender();
    });

    expect(numberHook.current[0]).toEqual(2);
    expect(computedHook.current[0]).toEqual(6);
  });

  it("should work with external signal", () => {
    const number = signal(1);
    const { rerender } = render(<NumberDisplay count={number.value} />);
    expect(screen.getByTestId("number-display")).toHaveTextContent("1");

    expect(number).toMatchObject({
      value: 1,
    });

    number.value++;
    expect(number).toMatchObject({
      value: 2,
    });

    rerender(<NumberDisplay count={number.value} />);
    expect(screen.getByTestId("number-display")).toHaveTextContent("2");
  });

  it("should work with external signal and callback", () => {
    const number = signal(1);
    const { rerender } = render(
      <NumberDisplay count={number.value} onClick={() => number.value++} />
    );
    expect(screen.getByTestId("number-display")).toHaveTextContent("1");

    expect(number).toMatchObject({
      value: 1,
    });

    fireEvent.click(screen.getByTestId("number-display"));

    expect(number).toMatchObject({
      value: 2,
    });

    act(() => {
      screen.getByTestId("number-display").click();
    });

    expect(number).toMatchObject({
      value: 3,
    });

    rerender(
      <NumberDisplay count={number.value} onClick={() => number.value++} />
    );
    expect(screen.getByTestId("number-display")).toHaveTextContent("3");
  });
});

describe("signal within a component", () => {
  it("should work with internal signal", () => {
    const number = signal(1);
    const dispose = number.subscribe((value) => {
      console.log("count", value);
    });

    const computed = signal(() => number.value * 2);
    function Computed() {
      return <div data-testid="computed">{computed.value}</div>;
    }

    function App() {
      return (
        <>
          <h2>Start editing to {number.value}</h2>
          <button onClick={() => number.value++}>Click me!</button>
        </>
      );
    }

    render(<App />);

    expect(screen.getByText(/^Start editing/)).toBeInTheDocument();
    expect(screen.getByText(/^Start editing/)).toHaveTextContent(
      "Start editing to 1"
    );

    expect(screen.getByText(/^Click me!/)).toBeInTheDocument();
    expect(screen.getByText(/^Click me!/)).toHaveTextContent("Click me!");

    fireEvent.click(screen.getByText(/^Click me!/));
    render(<Computed />);

    expect(screen.getByText(/^Start editing/)).toHaveTextContent(
      "Start editing to 2"
    );
    expect(screen.getByTestId("computed")).toHaveTextContent("4");

    fireEvent.click(screen.getByText(/^Click me!/));
    expect(screen.getByTestId("computed")).toHaveTextContent("6");
  });

  it("should work when passed as props", () => {
    function Morphing(props: { count: number; onClick?: () => void }) {
      return (
        <button data-testid="morphing" onClick={props.onClick}>
          {props.count}
        </button>
      );
    }

    const number = signal(1);
    const { rerender } = render(<Morphing count={number.value} />);

    expect(screen.getByTestId("morphing")).toBeInTheDocument();
    expect(screen.getByTestId("morphing")).toHaveTextContent("1");

    number.value++;
    rerender(<Morphing count={number.value} />);
    expect(screen.getByTestId("morphing")).toHaveTextContent("2");
  });
});
