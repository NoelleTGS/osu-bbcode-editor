document.addEventListener('DOMContentLoaded', () => {
    const bbcodeInput = document.getElementById('bbcode-input');
    const bbcodePreview = document.getElementById('bbcode-preview');
    const errorMessageElement = document.getElementById('error-message');
    const toolbarButtons = document.querySelectorAll('.toolbar button');
    bbcodePreview.innerHTML = parseBBCode(bbcodeInput.value);

    bbcodeInput.addEventListener('input', () => {
        errorMessageElement.textContent = "";
        bbcodePreview.innerHTML = parseBBCode(bbcodeInput.value);
    });

    toolbarButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tag = button.getAttribute('data-tag');
            insertTag(tag);
        });
    });

    window.changeFontSize = function() {
    const selectElement = document.getElementById('size-select-select');
    const selectedValue = selectElement.value;

        if (selectedValue) {
            insertTag("size=" + selectedValue);
            // Reset the dropdown to the hidden option
            selectElement.selectedIndex = 0;
        }
    }

    function insertTag(tag) {
        console.log(tag);
        const startTag = `[${tag}]`;
        let strippedTag = tag.replace(/[^\a-zA-Z]/g, '');
        const endTag = `[/${strippedTag}]`;
        const { selectionStart, selectionEnd, value } = bbcodeInput;
        const selectedText = value.substring(selectionStart, selectionEnd);

        // Set caret position to directly after = sign if there is one, set to inside the tags otherwise
        let caretPosition;
        if (tag.length === strippedTag.length + 1) {
            caretPosition = selectionStart + startTag.length - 1;
        } else {
            caretPosition = selectionStart + startTag.length;
        }
        const newText = startTag + selectedText + endTag;

        bbcodeInput.setRangeText(newText, selectionStart, selectionEnd, 'end');
        bbcodeInput.focus();
        bbcodeInput.setSelectionRange(caretPosition, caretPosition);
    }
});

/**
 * Tags taken in order from https://osu.ppy.sh/wiki/en/BBCode
 * @param {string} text
 * @returns {string}
 */
function parseBBCode(text) {
    let parsedText = text;

    // Newlines
    parsedText = parsedText.replace(/\n/g, '<br>');
    parsedText = parsedText.replace(/\[\/heading]<br>/g, '[/heading]');

    // Bold
    parsedText = parsedText.replace(/\[b](.*?)\[\/b]/gis, '<strong>$1</strong>');

    // Italic
    parsedText = parsedText.replace(/\[i](.*?)\[\/i]/gis, '<em>$1</em>');

    // Underline
    parsedText = parsedText.replace(/\[u](.*?)\[\/u]/gis, '<u>$1</u>');

    // Strikethrough
    parsedText = parsedText.replace(/\[s](.*?)\[\/s]/gis, '<s>$1</s>');

    // Colour
    parsedText = parsedText.replace(/\[color=(.*?)](.*?)\[\/color]/gis, '<span style="color:$1;">$2</span>');

    // Font size
    parsedText = parsedText.replace(/\[size=(.*?)](.*?)\[\/size]/gis, function(match, p1, p2) {
        return '<span style="font-size:' + p1 + '%;">' + p2 + '</span>';
    });

    // Spoiler
    parsedText = parsedText.replace(/\[spoiler](.*?)\[\/spoiler]/gis, '<span class="spoiler">$1</span>');

    // Box
    parsedText = parseBoxes(parsedText);

    // Spoilerbox

    // Quote
    parsedText = parsedText.replace(/\[quote](.*?)\[\/quote]/gis, '<blockquote>$1</blockquote>');
    parsedText = parsedText.replace(/\[quote=(.*?)](.*?)\[\/quote]/gis, '<blockquote><strong>$1 wrote:</strong><br>$2</blockquote>');

    // Inline code
    parsedText = parsedText.replace(/\[code](.*?)\[\/code]/gis, '<pre>$1</pre>');

    // Code block

    // Centre
    parsedText = parsedText.replace(/\[centre](.*?)\[\/centre]/gis, function(match, p1) {
        return '<div style="text-align: center;">' + p1 + '</div>';
    });

    // URL
    parsedText = parsedText.replace(/\[url](.*?)\[\/url]/gis, '<a href="$1" target="_blank">$1</a>');
    parsedText = parsedText.replace(/\[url=(.*?)](.*?)\[\/url]/gis, '<a href="$1" target="_blank">$2</a>');

    // Profile
    parsedText = parsedText.replace(/\[profile=(.*?)](.*?)\[\/profile]/gis, '<strong><a href="https://osu.ppy.sh/users/$1" target="_blank">$2</a></strong>');

    // Formatted lists
    parsedText = parsedText.replace(/\[list](.*?)\[\/list]/gis, '<ul>$1</ul>');
    parsedText = parsedText.replace(/\[\*](.*?)(?=\[\*]|<\/ul>)/gis, '<li>$1</li>');

    // Email

    // Images
    parsedText = parsedText.replace(/\[img](.*?)\[\/img]/gis, '<img src="$1" alt="Image">');

    // Imagemap

    // YouTube

    // Audio

    // Heading (v1)
    parsedText = parsedText.replace(/\[heading](.*?)\[\/heading]/gis, '<span style="color:#e0b8ca;"><h2>$1</h2></span>');

    // Notice
    parsedText = parsedText.replace(/\[notice](.*?)\[\/notice]/gis, '<div class="notice">$1</div>');
    parsedText = parsedText.replace(/(<\/div>\s*)<br>/g, '</div>');

    return parsedText;
}

function errorMessage(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
}

let boxCounters = {}

function parseBoxes(text) {
    const boxOpenRegex = /\[box=(.*?)]([\s\S]*)/i;
    const boxCloseRegex = /([\s\S]*?)\[\/box]/i;
    let match, matchNew, textNew;

    while (match = boxOpenRegex.exec(text)) {
        const boxName = match[1];
        !boxCounters[boxName] ? boxCounters[boxName] = 1 : boxCounters[boxName] += 1
        textNew = text.substring(0, match.index);

        matchNew = boxCloseRegex.exec(match[2]);

        try {
            const boxContent = matchNew[1];
            textNew += createBox(boxName, boxContent);
            textNew += text.substring(match.index + 6 + boxName.length + matchNew[0].length);

            text = textNew;
        } catch ({ name, message }) {
            errorMessage("An error occurred while parsing boxes. Please make sure all your boxes are terminated with a [/box] tag.");
            return text;
        }

    }
    boxCounters = {}
    return text;
}

function createBox(name, content) {
    content = content.replace(/^<br>/,"");
    content = content.replace(/<br>$/,"");
    const boxId = `box-${name.substring(0, 9)}-${boxCounters[name]}`;
    const isOpen = boxStates[boxId] === 'open';
    return `
        <div class="box" onclick="toggleBox('${boxId}', this)">
            <i class="fa-solid ${isOpen ? 'fa-angle-down' : 'fa-angle-right'} arrow"></i><strong>${name}</strong>
        </div>
        <div class="box-content" id="${boxId}" style="display: ${isOpen ? 'block' : 'none'};">
            ${content}
        </div>
    `;
}

const boxStates = {};

function toggleBox(boxId, element) {
    const boxContent = document.getElementById(boxId);
    const icon = element.querySelector('.arrow');
    const isOpen = boxContent.style.display === "block";

    if (!isOpen) {
        boxContent.style.display = "block";
        icon.classList.remove('fa-angle-right');
        icon.classList.add('fa-angle-down');
        boxStates[boxId] = 'open';
    } else {
        boxContent.style.display = "none";
        icon.classList.remove('fa-angle-down');
        icon.classList.add('fa-angle-right');
        boxStates[boxId] = 'closed';
    }
}
