"use client";

import Divider from "./divider";

export default function ApprovalTable() {
  // TODO: will update implementation, still thinking
  return (
    <div className="m-[10%] h-[40%] w-full">
      <p className="text-2xl font-semibold">Approvals</p>
      <Divider />
      <div className="overflow-x-auto">
        <table className="table table-zebra w-[80%] border-2 border-gray-400">
          <thead>
            <tr>
              <th className="text-base">Job</th>
              <th className="text-base">Type</th>
              <th className="text-base">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cy Ganderton</td>
              <td>Quality Control Specialist</td>
              <td>Blue</td>
            </tr>
            <tr>
              <td>Hart Hagerty</td>
              <td>Desktop Support Technician</td>
              <td>Purple</td>
            </tr>
            <tr>
              <td>Brice Swyre</td>
              <td>Tax Accountant</td>
              <td>Red</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
