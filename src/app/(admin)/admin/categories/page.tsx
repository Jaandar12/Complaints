import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllCategories } from "@/server/queries/categories";

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  return (
    <Card className="space-y-4">
      <CardHeader title="Complaint categories" subtitle="Control tags shown to tenants" actions={<Button>New category</Button>} />
      <div className="divide-y divide-slate-200">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{category.name}</p>
              <p className="text-xs text-slate-500">Group: {category.category_group ?? "General"}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  category.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                {category.is_active ? "Active" : "Inactive"}
              </span>
              <Button variant="ghost" className="text-blue-600">
                Edit
              </Button>
              <Button variant="ghost" className="text-rose-600">
                Delete
              </Button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="py-4 text-sm text-slate-500">No categories configured.</p>}
      </div>
    </Card>
  );
}
