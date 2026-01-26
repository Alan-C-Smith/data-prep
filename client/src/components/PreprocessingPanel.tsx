import { useState } from "react";
import { usePreprocessFile } from "@/hooks/use-files";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface PreprocessingPanelProps {
  fileId: number;
  columns: string[];
  data: any[];
  selectedColumns?: Set<string>;
  onColumnSelect?: (column: string) => void;
  onSuccess: () => void;
}

type OperationType =
  | "capitalize"
  | "lowercase"
  | "capitalizeFirst"
  | "removeCharacters"
  | "replaceCharacters"
  | "removeDuplicates"
  | "removeRows"
  | "convertDate";

export function PreprocessingPanel({
  fileId,
  columns,
  data,
  selectedColumns,
  onColumnSelect,
  onSuccess,
}: PreprocessingPanelProps) {
  const { mutate: preprocess, isPending } = usePreprocessFile();
  const { toast } = useToast();

  const [operation, setOperation] = useState<OperationType>("capitalize");
  const [internalSelectedColumns, setInternalSelectedColumns] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [removeChars, setRemoveChars] = useState("");
  const [findStr, setFindStr] = useState("");
  const [replaceStr, setReplaceStr] = useState("");
  const [rowIndices, setRowIndices] = useState("");
  const [dateFormat, setDateFormat] = useState("yyyy-MM-dd");

  // Use provided selectedColumns or fall back to internal state
  const currentSelectedColumns = selectedColumns || internalSelectedColumns;
  const handleColumnSelect = onColumnSelect || ((col: string) => {
    const newSelected = new Set(internalSelectedColumns);
    if (newSelected.has(col)) {
      newSelected.delete(col);
    } else {
      newSelected.add(col);
    }
    setInternalSelectedColumns(newSelected);
  });

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      // Select all columns
      columns.forEach(col => {
        if (!currentSelectedColumns.has(col)) {
          handleColumnSelect(col);
        }
      });
      setSelectAll(true);
    } else {
      // Deselect all columns
      Array.from(currentSelectedColumns).forEach(col => {
        handleColumnSelect(col);
      });
      setSelectAll(false);
    }
  };

  const handleApply = () => {
    const columnsToApply = Array.from(currentSelectedColumns);

    // Validate operation-specific inputs
    if (
      [
        "capitalize",
        "lowercase",
        "capitalizeFirst",
        "removeCharacters",
        "replaceCharacters",
        "removeDuplicates",
      ].includes(operation) &&
      columnsToApply.length === 0
    ) {
      toast({
        title: "Please select at least one column",
        variant: "destructive",
      });
      return;
    }

    if (operation === "removeCharacters" && !removeChars) {
      toast({
        title: "Please specify characters to remove",
        variant: "destructive",
      });
      return;
    }

    if (operation === "replaceCharacters") {
      if (!findStr || !replaceStr) {
        toast({
          title: "Please specify find and replace values",
          variant: "destructive",
        });
        return;
      }
    }

    if (operation === "removeRows") {
      if (!rowIndices) {
        toast({
          title: "Please specify row indices",
          variant: "destructive",
        });
        return;
      }
      const indices = rowIndices
        .split(",")
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n));
      if (indices.length === 0) {
        toast({
          title: "Invalid row indices",
          variant: "destructive",
        });
        return;
      }
    }

    let payload: any = {};

    switch (operation) {
      case "capitalize":
        payload = { type: "capitalize", columns: columnsToApply };
        break;
      case "lowercase":
        payload = { type: "lowercase", columns: columnsToApply };
        break;
      case "capitalizeFirst":
        payload = { type: "capitalizeFirst", columns: columnsToApply };
        break;
      case "removeCharacters":
        payload = {
          type: "removeCharacters",
          columns: columnsToApply,
          characters: removeChars,
        };
        break;
      case "replaceCharacters":
        payload = {
          type: "replaceCharacters",
          columns: columnsToApply,
          find: findStr,
          replace: replaceStr,
        };
        break;
      case "removeDuplicates":
        payload = { type: "removeDuplicates", columns: columnsToApply };
        break;
      case "removeRows":
        const indices = rowIndices
          .split(",")
          .map((s) => parseInt(s.trim()))
          .filter((n) => !isNaN(n));
        payload = { type: "removeRows", indices };
        break;
      case "convertDate":
        payload = {
          type: "convertDate",
          columns: columnsToApply,
          format: dateFormat,
        };
        break;
    }

    preprocess(
      { id: fileId, action: payload },
      {
        onSuccess: () => {
          toast({
            title: "Preprocessing applied successfully",
            variant: "default",
          });
          // Reset form
          setInternalSelectedColumns(new Set());
          setSelectAll(false);
          setRemoveChars("");
          setFindStr("");
          setReplaceStr("");
          setRowIndices("");
          onSuccess();
        },
        onError: (error) => {
          toast({
            title: "Error applying preprocessing",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const columnSelectionUI = (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 p-2 border rounded-lg bg-muted/50">
        <Checkbox
          id="select-all"
          checked={selectAll || currentSelectedColumns.size === columns.length}
          onCheckedChange={handleSelectAllChange}
        />
        <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
          Select All Columns
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
        {columns.map((col) => (
          <div key={col} className="flex items-center space-x-2">
            <Checkbox
              id={`col-${col}`}
              checked={currentSelectedColumns.has(col)}
              onCheckedChange={() => handleColumnSelect(col)}
            />
            <label
              htmlFor={`col-${col}`}
              className="text-sm cursor-pointer truncate"
            >
              {col}
            </label>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground italic">
        💡 Tip: You can also click column headings in the data table below to select/deselect them
      </p>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Data Preprocessing</CardTitle>
        <CardDescription>
          Select operations to transform your data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Operation Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Operation</label>
          <Select value={operation} onValueChange={(value: any) => setOperation(value)}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Text Case</SelectLabel>
                <SelectItem value="capitalize">Capitalize (UPPERCASE)</SelectItem>
                <SelectItem value="lowercase">Lowercase (lowercase)</SelectItem>
                <SelectItem value="capitalizeFirst">
                  Capitalize First Letter (Title Case)
                </SelectItem>
              </SelectGroup>
              
              <SelectGroup>
                <SelectLabel>Remove / Replace</SelectLabel>
                <SelectItem value="removeCharacters">Remove Characters</SelectItem>
                <SelectItem value="replaceCharacters">Replace Characters</SelectItem>
              </SelectGroup>

              <SelectGroup>
                <SelectLabel>Text Processing</SelectLabel>
                <SelectItem value="removeDuplicates">Remove Duplicates</SelectItem>
              </SelectGroup>

              <SelectGroup>
                <SelectLabel>Date / Time</SelectLabel>
                <SelectItem value="convertDate">Convert Date Format</SelectItem>
              </SelectGroup>

              <SelectGroup>
                <SelectLabel>Row Operations</SelectLabel>
                <SelectItem value="removeRows">Remove Rows</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Column Selection - Hidden for Remove Rows */}
        {operation !== "removeRows" && (
          <div className="space-y-2">
            <label className="text-sm font-semibold">Select Columns</label>
            {columnSelectionUI}
          </div>
        )}

        {/* Operation-Specific Inputs */}
        {operation === "removeCharacters" && (
          <div className="space-y-2">
            <label htmlFor="removeChars" className="text-sm font-semibold">
              Characters to Remove
            </label>
            <Input
              id="removeChars"
              placeholder="e.g., !@#$"
              value={removeChars}
              onChange={(e) => setRemoveChars(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter characters you want to remove. Special regex characters will
              be escaped automatically.
            </p>
          </div>
        )}

        {operation === "replaceCharacters" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="findStr" className="text-sm font-semibold">
                Find
              </label>
              <Input
                id="findStr"
                placeholder="Text to find"
                value={findStr}
                onChange={(e) => setFindStr(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="replaceStr" className="text-sm font-semibold">
                Replace With
              </label>
              <Input
                id="replaceStr"
                placeholder="Replacement text"
                value={replaceStr}
                onChange={(e) => setReplaceStr(e.target.value)}
              />
            </div>
          </div>
        )}

        {operation === "convertDate" && (
          <div className="space-y-2">
            <label htmlFor="dateFormat" className="text-sm font-semibold">
              Date Format
            </label>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger id="dateFormat" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                <SelectItem value="yyyy-MM-dd HH:mm:ss">
                  yyyy-MM-dd HH:mm:ss
                </SelectItem>
                <SelectItem value="MMMM d, yyyy">MMMM d, yyyy</SelectItem>
                <SelectItem value="MMM d, yyyy">MMM d, yyyy</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Dates will be parsed and reformatted to this pattern.
            </p>
          </div>
        )}

        {operation === "removeRows" && (
          <div className="space-y-2">
            <label htmlFor="rowIndices" className="text-sm font-semibold">
              Row Indices to Remove (0-based)
            </label>
            <Textarea
              id="rowIndices"
              placeholder="e.g., 0, 2, 5 or enter each on a new line"
              value={rowIndices}
              onChange={(e) => setRowIndices(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Enter row numbers separated by commas. For example: 0, 2, 5 will
              remove the 1st, 3rd, and 6th rows. View row numbers in the leftmost column of the table below.
            </p>
            <div className="p-2 bg-muted rounded text-xs">
              <p className="font-semibold mb-1">Current data ({data.length} rows):</p>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {data.slice(0, 5).map((_, i) => (
                  <p key={i}>Row {i}: {Object.values(_).slice(0, 2).join(", ")}</p>
                ))}
                {data.length > 5 && <p>... and {data.length - 5} more rows</p>}
              </div>
            </div>
          </div>
        )}

        {/* Apply Button */}
        <Button
          onClick={handleApply}
          disabled={isPending}
          className="w-full"
          size="lg"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Applying..." : "Apply Operation"}
        </Button>
      </CardContent>
    </Card>
  );
}
