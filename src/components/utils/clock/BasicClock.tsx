import  { useEffect, useState } from "react";
import dayjs from "dayjs";

export const BasicClock = () => {
    const [now, setNow] = useState<Date>(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatted = dayjs(now).format("ddd, D MMM, HH:mm:ss");

    return <span>{formatted} (local time)</span>;
};

