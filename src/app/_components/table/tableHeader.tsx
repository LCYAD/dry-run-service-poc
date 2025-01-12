type TableHeaderProps = {
  headers: { name: string; widthPercentageStr: string }[];
};

export default function TableHeader({ headers }: TableHeaderProps) {
  return (
    <thead>
      <tr>
        {headers.map((header) => (
          <th
            key={header.name}
            className="text-based"
            style={{ width: header.widthPercentageStr }}
          >
            {header.name}
          </th>
        ))}
      </tr>
    </thead>
  );
}
