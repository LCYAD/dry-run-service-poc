type TableHeaderProps = {
  headers: string[];
};

export default function TableHeader({ headers }: TableHeaderProps) {
  return (
    <thead>
      <tr>
        {headers.map((header) => (
          <th key={header} className="text-base">
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
}
