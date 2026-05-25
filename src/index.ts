type ToDo = {
    id: string;
    todo: string;
    due?: Temporal.PlainDateTime;
    completed: boolean;
};
const localData = localStorage.getItem("to-do");
const toDoList: ToDo[] = localData ? (JSON.parse(localData) as ToDo[]) : [];
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
const todoEditDialog = document.querySelector(
    "#to-do-edit",
) as HTMLDialogElement;

/**
 * toDoList 리스트를 Local Storage에 저장합니다.
 */
function save(): void {
    localStorage.setItem("to-do", JSON.stringify(toDoList));
}

/**
 * Temporal.PlainDateTime을 문자열로 변환합니다.
 * @param {Temporal.PlainDateTime} dt - PlainDateTime
 * @returns "년-월-일T시:분" 형태의 문자열
 */
function plainDateTimeToString(dt: Temporal.PlainDateTime): string {
    return dt.toString({
        smallestUnit: "minutes",
    });
}

/**
 * 할 일 목록을 브라우저에 렌더링합니다.
 */
function renderList(): void {
    if (toDoList.length <= 0) {
        const clone = document.importNode(toDoPlaceholder.content, true);
        toDoListElement.replaceChildren(clone);
    } else {
        toDoListElement.replaceChildren();
        toDoList.forEach((item) => {
            const clone = document.importNode(toDoTemplate.content, true);
            const todoField = clone.querySelector(
                ".todo-field-todo",
            ) as HTMLDivElement;
            const dueField = clone.querySelector(
                ".todo-field-due",
            ) as HTMLDivElement;
            const deleteButton = clone.querySelector(
                ".delete-btn",
            ) as HTMLButtonElement;
            const editButton = clone.querySelector(
                ".edit-btn",
            ) as HTMLButtonElement;
            const toDoListItem = clone.querySelector("li") as HTMLLIElement;
            const toDoCompCheckbox = clone.querySelector(
                "input",
            ) as HTMLInputElement;

            toDoListItem.id = item.id;
            toDoCompCheckbox.checked = item.completed;
            deleteButton.addEventListener("click", () => {
                deleteToDo(item.id);
            });
            editButton.addEventListener("click", (event) => {
                event.preventDefault();
                editToDo(item.id);
            });
            toDoCompCheckbox.addEventListener("change", (event) => {
                const target = event.target as HTMLInputElement;
                completeToDo(item.id, target.checked);
            });

            todoField.textContent = item.todo;

            if (item.due) {
                dueField.textContent = Temporal.PlainDateTime.from(
                    item.due,
                ).toLocaleString("ko-KR", {
                    hour12: true,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                });
            } else {
                dueField.remove();
            }

            if (item.completed) {
                todoField.classList.add("text-gray-400", "line-through");
            } else if (
                item.due &&
                Temporal.PlainDateTime.compare(
                    item.due,
                    Temporal.Now.plainDateTimeISO(),
                ) <= 0
            ) {
                todoField.textContent = `!! ${todoField.textContent}`;
                todoField.classList.add("text-red-700");
            }
            toDoListElement.appendChild(clone);
        });
    }
}

/**
 * 할 일 목록에 요소를 추가합니다.
 *
 * 해당 함수는 Event Handler에서 사용됩니다.
 */
function addToDo(): void {
    const formData = new FormData(toDoAddForm);
    if (formData.get("add-due-date")) {
        toDoList.push({
            id: crypto.randomUUID(),
            todo: formData.get("add-todo") as string,
            due: Temporal.PlainDateTime.from(
                formData.get("add-due-date") as string,
            ),
            completed: false,
        });
    } else {
        toDoList.push({
            id: crypto.randomUUID(),
            todo: formData.get("add-todo") as string,
            completed: false,
        });
    }
    save();
    renderList();
}

/**
 * 할 일 목록에서 요소를 삭제합니다.
 * @param id UUID
 */
function deleteToDo(id: string): void {
    toDoList.splice(
        toDoList.findIndex((element) => element.id === id),
        1,
    );
    save();
    renderList();
}

/**
 * 할 일의 완료/미완료를 전환합니다.
 * @param id 변경할 할 일의 UUID
 * @param checked 체크박스의 true/false.
 */
function completeToDo(id: string, checked: boolean): void {
    toDoList[toDoList.findIndex((element) => element.id === id)].completed =
        checked;
    save();
    renderList();
}

/**
 * 할 일 목록을 정렬합니다.
 *
 * 정렬 기준은 완료 여부 -> 이름 순입니다.
 */
function sortToDoList(): void {
    toDoList.sort((a, b) => {
        if (a.due && b.due) {
            return (
                Number(b.completed) - Number(a.completed) ||
                Temporal.PlainDateTime.compare(a.due, b.due) ||
                a.todo.localeCompare(b.todo)
            );
        } else {
            return (
                Number(b.completed) - Number(a.completed) ||
                a.todo.localeCompare(b.todo)
            );
        }
    });
}

function editToDo(id: string): void {
    const idx = toDoList.findIndex((obj) => obj.id === id);

    const todoEditForm = todoEditDialog.querySelector(
        "form",
    ) as HTMLFormElement;
    const cancelBtn = todoEditDialog.querySelector(
        "#to-do-edit-cancel",
    ) as HTMLButtonElement;
    const nameField = todoEditForm.querySelector(
        "#to-do-edit-name",
    ) as HTMLInputElement;
    const dueField = todoEditForm.querySelector(
        "#to-do-edit-due",
    ) as HTMLInputElement;

    cancelBtn.addEventListener("click", (event) => {
        event.preventDefault();
        todoEditForm.reset();
        todoEditDialog.close();
    });
    nameField.value = toDoList[idx].todo;
    if (toDoList[idx].due) {
        dueField.value = plainDateTimeToString(toDoList[idx].due);
    }

    todoEditDialog.showModal();
    todoEditForm.addEventListener("submit", () => {
        const formData = new FormData(todoEditForm);
        if (formData.get("to-do-edit-name")) {
            toDoList[idx].todo = formData.get("to-do-edit-name") as string;
        }
        if (formData.get("to-do-edit-due")) {
            toDoList[idx].due = Temporal.PlainDateTime.from(
                formData.get("to-do-edit-due") as string,
            );
        } else {
            toDoList[idx].due = undefined;
        }

        save();
        renderList();
    });
}

const currentTime = Temporal.Now.plainDateTimeISO();
(toDoAddForm.querySelector("#add-due-date") as HTMLInputElement).min =
    plainDateTimeToString(currentTime);
toDoAddForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addToDo();
});
sortToDoList();
renderList();
