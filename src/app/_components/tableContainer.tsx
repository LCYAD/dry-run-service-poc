import Divider from "./divider";

type Props = Readonly<{ children: React.ReactNode }> & {
  title: string;
};

export default function TableContainer({ children, title }: Props) {
  return (
    <div className="m-[10%] h-[40%] w-full">
      <p className="text-2xl font-semibold">{title}</p>
      <Divider />
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
