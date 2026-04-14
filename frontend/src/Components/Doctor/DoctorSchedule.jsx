import React, { useState } from "react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DoctorSchedule() {
  const [selected, setSelected] = useState([]);
  const [slots, setSlots] = useState({});

  const toggle = (day) => {
    setSelected((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const addSlot = (day) => {
    const time = prompt("Enter slot (10AM-12PM)");
    if (!time) return;

    setSlots((prev) => ({
      ...prev,
      [day]: prev[day] ? [...prev[day], time] : [time],
    }));
  };

  return (
    <div>

     
      <div className="flex gap-3 mb-6">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => toggle(d)}
            className={`px-4 py-2 rounded-xl ${
              selected.includes(d)
                ? "bg-[#7C6A9B] text-white"
                : "bg-gray-100"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

    
      {selected.map((day) => (
        <div key={day} className="mb-4 bg-white p-4 rounded-xl border">
          <h3 className="font-semibold">{day}</h3>

          {(slots[day] || []).map((s, i) => (
            <p key={i}>{s}</p>
          ))}

          <button
            onClick={() => addSlot(day)}
            className="mt-2 px-3 py-1 bg-[#7C6A9B] text-white rounded"
          >
            Add Slot
          </button>
        </div>
      ))}
    </div>
  );
}