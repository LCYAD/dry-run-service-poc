"use client";

import Image from "next/image";

type Props = {
  clickHandler: () => void;
};

export default function DeleteBtn({ clickHandler }: Props) {
  return (
    <button onClick={clickHandler} className="btn mx-1">
      <Image src="trashCan.svg" width={30} height={30} alt="delete" />
    </button>
  );
}
