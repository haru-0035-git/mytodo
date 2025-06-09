import { FC, MouseEventHandler } from "react";

type ToggleButtonProps = {
  open: boolean;
  onClick: MouseEventHandler;
  controls: string;
  label: string;
};
export const ToggleButton: FC<ToggleButtonProps> = ({
  open,
  onClick,
  controls,
  label,
}) => {
  return (
    <button
      className={`px-4 py-2 rounded-md text-white ${
        open ? "bg-blue-500" : "bg-gray-500"
      }`}
      onClick={onClick}
      aria-controls={controls}
      aria-expanded={open}
    >
      <span className="line-1"></span>
      <span className="line-2"></span>
    </button>
  );
};
