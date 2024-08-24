document.addEventListener('DOMContentLoaded', () => {
    const bbcodeInput = document.getElementById('bbcode-input');
    const bbcodePreview = document.getElementById('bbcode-preview');
    bbcodePreview.innerHTML = parseBBCode(bbcodeInput.value);

    bbcodeInput.addEventListener('input', () => {
        bbcodePreview.innerHTML = parseBBCode(bbcodeInput.value);
    });
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
    parsedText = parsedText.replace(/\[quote=(.*?)](.*?)\[\/quote]/gis, '<blockquote><strong>$1 said:</strong><br>$2</blockquote>');

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

    // Notice
    parsedText = parsedText.replace(/\[notice](.*?)\[\/notice]/gis, '<div class="notice">$1</div>');
    parsedText = parsedText.replace(/(<\/div>\s*)<br>/g, '</div>');

    return parsedText;
}

function parseBoxes(text) {
    const boxOpenRegex = /\[box=(.*?)]([\s\S]*)/i;
    const boxCloseRegex = /([\s\S]*?)\[\/box]/i;
    let match, matchNew, textNew;

    while (match = boxOpenRegex.exec(text)) {
        textNew = text.substring(0, match.index);

        matchNew = boxCloseRegex.exec(match[2]);

        const boxName = match[1];
        const boxContent = matchNew[1];

        // console.log("Found box with name: " + boxName + " and content: " + boxContent);

        textNew += createBox(boxName, boxContent);
        textNew += text.substring(match.index + 6 + boxName.length + matchNew[0].length);

        text = textNew;
    }

    //text = text.replace(/(<\/div>\s*)<br>/g, '</div>');

    return text;
}

function createBox(name, content){
    console.log(content)
    content = content.replace(/^<br>/,"");
    content = content.replace(/<br>$/,"");
    console.log(content)
    const boxId = 'box-' + Math.random().toString(36).substring(2, 9);
    return `
        <div class="box" onclick="toggleBox('${boxId}', this)">
            <i class="fa-solid fa-angle-right arrow"></i><strong>${name}</strong>
        </div>
        <div class="box-content" id="${boxId}" style="display: none;">
            ${content}
        </div>
    `;
}

function toggleBox(boxId, element) {
    const boxContent = document.getElementById(boxId);
    const icon = element.querySelector('.arrow');
    if (boxContent.style.display === "none" || boxContent.style.display === "") {
        boxContent.style.display = "block";
        icon.classList.remove('fa-angle-right');
        icon.classList.add('fa-angle-down');
    } else {
        boxContent.style.display = "none";
        icon.classList.remove('fa-angle-down');
        icon.classList.add('fa-angle-right');
    }
}