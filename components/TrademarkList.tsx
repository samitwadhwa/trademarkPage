import React from "react";
import imageNotAvailable from "@/assets/images/ImageNotAvailable.png";
import Refresh from "@/assets/images/Refresh.png";

interface Trademark {
  id: number;
  mark_identification: string;
  status: string;
  owner: string;
  description: string;
  date: string;
  renewal_date: string;
}
interface TrademarkListProps {
  trademarks: Trademark[];
}

const TrademarkList: React.FC<TrademarkListProps> = ({ trademarks }) => {
  return (
    <div>
      {trademarks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 font-myCustomFont">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-md font-500 text-black">
                  Mark
                </th>
                <th className="px-6 py-3 text-left text-md font-500 text-black">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-md font-500 text-black">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-md font-500 text-black">
                  Class/Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 font-myCustomFont">
              {trademarks.map((trademark) => (
                <tr key={trademark.id}>
                  <td className="px-2 py-4 whitespace-nowrap">
                    <div className="bg-white  w-24 h-24 rounded-md p-2 shadow-lg">
                    <img
                      src={imageNotAvailable.src}
                      className="w-20 h-20"
                      alt="image not available"
                    />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black font-bold">
                      {trademark.mark_identification}
                    </div>
                    <div className="text-sm text-gray-500">
                      {trademark.owner}
                    </div>
                    <div className="text-sm text-black font-bold mt-4">
                      {trademark.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {trademark.date}
                    </div>
                  </td>
                  <td className="flex flex-col items-start px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex text-md font-semibold rounded-full text-success">
                      {trademark.status.charAt(0).toUpperCase() +
                        trademark.status.slice(1)}
                    </span>
                    <span className="text-xs text-black font-bold">
                      <span className="text-xs text-grey-500 font-medium">
                        on
                      </span>{" "}
                      {trademark.date}
                    </span>
                    <div className="flex items-center gap-1 mt-8">
                      <img
                        src={Refresh.src}
                        className="w-4 h-4 cursor-pointer"
                        alt="refresh"
                      />
                      <span className="text-xs text-black font-bold">
                        {trademark.renewal_date}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trademark.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="font-myCustomFont">No results found</p>
      )}
    </div>
  );
};

export default TrademarkList;
