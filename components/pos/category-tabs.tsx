"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PosCategory } from "@/features/pos/types/pos.types";

type CategoryTabsProps = {
  categories: PosCategory[];
  value: string | null;
  onChange: (categoryId: string | null) => void;
};

export function CategoryTabs({ categories, value, onChange }: CategoryTabsProps) {
  const tabValue = value ?? "all";

  return (
    <Tabs
      value={tabValue}
      onValueChange={(next) => onChange(next === "all" ? null : next)}
      className="w-full"
    >
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-[#EFE6D7]/60 p-1">
        <TabsTrigger
          value="all"
          className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#2C3E57] data-[state=active]:text-white"
        >
          All
        </TabsTrigger>
        {categories.map((category) => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#2C3E57] data-[state=active]:text-white"
          >
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
