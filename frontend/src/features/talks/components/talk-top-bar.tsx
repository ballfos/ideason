import { Link } from "@tanstack/react-router";
import { Header } from "#/components/ui/header";
import { ArrowLeft, Trash2 } from "lucide-react";
import * as React from "react";

export interface TalkTopBarProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    titleClassName?: string;
    helpGuide?: React.ReactNode;
    onDelete?: () => void;
}

export function TalkTopBar({
    className,
    helpGuide,
    onDelete,
    title,
    titleClassName,
    ...props
}: TalkTopBarProps) {
    return (
        <Header
            title={title}
            className={className}
            titleClassName={titleClassName}
            leftAction={
                <Link
                    to="/talks"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 text-[#7a6446] hover:bg-white transition-all shadow-sm active:scale-95 min-[451px]:hidden"
                >
                    <ArrowLeft className="h-6 w-6" strokeWidth={3} />
                </Link>
            }
            userAction={
                onDelete && (
                    <button
                        onClick={onDelete}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-[#d5cba1] text-[#7a6446] hover:bg-[#ffcb05] hover:border-[#ffcb05] hover:text-white transition-all active:scale-95 shadow-sm min-[451px]:hidden"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                )
            }
            helpGuide={helpGuide}
            {...props}
        />
    );
}
