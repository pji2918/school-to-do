type ToDo = {
    todo: string;
    due?: Temporal.PlainDateTime;
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

/**
 * 할 일 목록에 요소를 추가합니다.
 *
 * 해당 함수는 Event Handler에서 사용됩니다.
 */
function addToDo(): void {
    const formData = new FormData(toDoAddForm);
    if (formData.get("add-due-date")) {
        toDoList.push({
            todo: formData.get("add-todo") as string,
            due: Temporal.PlainDateTime.from(
                formData.get("add-due-date") as string,
            ),
        });
    } else {
        toDoList.push({
            todo: formData.get("add-todo") as string,
        });
    }
    save();
    renderList();
}

const currentTime = Temporal.Now.plainDateTimeISO();
(toDoAddForm.querySelector("#add-due-date") as HTMLInputElement).min =
    plainDateTimeToString(currentTime);
toDoAddForm.onsubmit = addToDo;
renderList();
