type ToDo = {
    todo: string;
    due?: Temporal.PlainDateTime;
};

const toDoList: ToDo[] = [];
const toDoListElement = document.querySelector(
    "#to-do-list",
) as HTMLOListElement;
const toDoTemplate = document.querySelector(
    "#to-do-elements",
) as HTMLTemplateElement;
const toDoPlaceholder = document.querySelector(
    "#to-do-empty-placeholder",
) as HTMLTemplateElement;
const toDoAddForm = document.querySelector("#todo-add-form") as HTMLFormElement;

function renderList(): void {
    if (toDoList.length <= 0) {
        const clone = document.importNode(toDoPlaceholder.content, true);
        toDoListElement.appendChild(clone);
    } else {
        toDoList.forEach((item) => {
            const clone = document.importNode(toDoTemplate.content, true);
            const todoField = clone.querySelector(".todo-field-todo");
            const dueField = clone.querySelector(".todo-field-due");

            if (!(todoField && dueField)) {
                throw new Error("Template is invalid");
            }

            todoField.textContent = item.todo;
            dueField.textContent =
                item.due?.toLocaleString("ko-KR", {
                    hour12: true,
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                }) ?? "";

            toDoListElement.appendChild(clone);
        });
    }
    console.log(toDoList);
}

function addToDo(): void {
    const formData = new FormData(toDoAddForm);
    if (formData.has("add-due-date")) {
        toDoList.push({
            todo: formData.get("add-todo") as string,
            due: Temporal.PlainDateTime.from(
                formData.get("add-todo") as string,
            ),
        });
    }
    renderList();
}

(toDoAddForm.querySelector("#add-due-date") as HTMLInputElement).setAttribute(
    "min",
    Temporal.Now.plainDateTimeISO().toString({ smallestUnit: "minutes" }),
);
toDoAddForm.onsubmit = addToDo;
renderList();
