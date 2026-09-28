export function SkeletonRow({ columns = 6 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i}>
          <div className="skeleton-block" />
        </td>
      ))}
    </tr>
  );
}
