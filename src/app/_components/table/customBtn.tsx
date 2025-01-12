"use client";

type Props = {
  text: string;
  clickHandler: () => void;
  disabled?: boolean;
};

export default function CustomBtn({
  clickHandler,
  text,
  disabled = false,
}: Props) {
  return (
    <button
      disabled={disabled}
      onClick={clickHandler}
      className="btn mx-1 w-24"
    >
      {text}
    </button>
  );
}
