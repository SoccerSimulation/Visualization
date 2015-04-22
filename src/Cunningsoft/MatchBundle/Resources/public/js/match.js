var clientWidth = 1400;
var clientHeight = 800;
var playingAreaBorder = 20;
var fpsFilterStrength = 20, frameTime = 0, lastLoopDate = new Date(), thisLoopDate;
function render(data)
{
    thisLoopDate = new Date();
    var thisFrameTime = thisLoopDate - lastLoopDate;
    frameTime += (thisFrameTime - frameTime) / fpsFilterStrength;
    lastLoopDate = thisLoopDate;
    pitch.clear();

    drawGras();
    drawRegions(data.regions);
    drawPitchMarkings();
    drawBall(data.ball);
    drawGoalRed(data.goalRed);
    drawGoalBlue(data.goalBlue);
    drawScore(data.goalRed, data.goalBlue);
    drawTeamRed(data.teamRed);
    drawTeamBlue(data.teamBlue);
    pitch.text(40, 10, (1000/frameTime).toFixed(1) + ' fps').attr('fill', '#fff');
}
function drawGras()
{
    pitch.rect(0, 0, clientWidth, clientHeight).attr('fill', '#090').attr('stroke', '#090');
}
function drawRegions(regions)
{
    if ($('#showRegions').is(':checked')) {
        $(regions).each(function (index, region) {
            pitch.rect(region.left, region.top, region.right - region.left, region.bottom - region.top).attr('stroke', '#0f0');
            pitch.text(region.left + (region.right - region.left) / 2, region.top + (region.bottom - region.top) / 2, region.id).attr('fill', '#0f0');
        });
    }
}
function drawBall(ball)
{
    pitch.circle(ball.position.x, ball.position.y, 5).attr('fill', '#fff').attr('stroke', '#fff');
}
function drawGoalRed(goalRed)
{
    pitch.rect(goalRed.center.x, goalRed.center.y - goalRed.height / 2, goalRed.width, goalRed.height).attr('stroke', '#f00');
}
function drawGoalBlue(goalBlue)
{
    pitch.rect(goalBlue.center.x - goalBlue.width, goalBlue.center.y - goalBlue.height / 2, goalBlue.width, goalBlue.height).attr('stroke', '#00f');
}
function drawPitchMarkings()
{
    pitch.circle(clientWidth / 2, clientHeight / 2, (clientWidth - playingAreaBorder) * 0.125).attr('stroke', '#fff');
    pitch.circle(clientWidth / 2, clientHeight / 2, 2).attr('fill', '#fff').attr('stroke', '#fff');
    pitch.path('M' + (clientWidth / 2) + ',' + playingAreaBorder + 'L' + (clientWidth / 2) + ',' + (clientHeight - playingAreaBorder)).attr('stroke', '#fff');
    pitch.path('M' + playingAreaBorder + ',' + playingAreaBorder + 'L' + (clientWidth - playingAreaBorder) + ',' + playingAreaBorder + 'L' + (clientWidth - playingAreaBorder) + ',' + (clientHeight - playingAreaBorder) + 'L' + playingAreaBorder + ',' + (clientHeight - playingAreaBorder) + 'L' + playingAreaBorder + ',' + playingAreaBorder).attr('stroke', '#fff');
}
function drawScore(goalRed, goalBlue)
{
    pitch.text(clientWidth / 2 - 30, clientHeight - 10, 'Red: ' + goalBlue.goalsScored).attr('fill', '#f00');

    pitch.text(clientWidth / 2 + 30, clientHeight - 10, 'Blue: ' + goalRed.goalsScored).attr('fill', '#00f');
}
function drawTeamRed(team)
{
    drawTeamInControl(team.inControl, 'Red');
    drawControllingPlayer(team.controllingPlayer);
    drawSupportSpots(team);
    drawTeamState(team.state, 160, '#f00');
    drawTeamDebugMessages(team.debug);
    drawPlayers(team.players, '#f00');
}
function drawTeamBlue(team)
{
    drawTeamInControl(team.inControl, 'Blue');
    drawControllingPlayer(team.controllingPlayer);
    drawSupportSpots(team);
    drawTeamState(team.state, 500, '#00f');
    drawTeamDebugMessages(team.debug);
    drawPlayers(team.players, '#00f');
}
function drawTeamInControl(inControl, color)
{
    if (inControl) {
        pitch.text(200, 10, color + ' in Control').attr('fill', '#fff');
    }
}
function drawControllingPlayer(player)
{
    if (player) {
        pitch.text(clientWidth - 150, 10, 'Controlling Player: ' + player.id).attr('fill', '#fff');
    }
}
function drawSupportSpots(team)
{
    if ($('#showSupportSpots').is(':checked') && team.inControl) {
        $(team.supportSpots).each(function (index, spot) {
            pitch.circle(spot.position.x, spot.position.y, spot.score * 5).attr('stroke', '#0f0');
        });
    }
}
function drawTeamState(state, x, color)
{
    pitch.text(x, clientHeight - 10, state).attr('fill', color);
}
function drawTeamDebugMessages(debug)
{
    $(debug).each(function(index, message) {
        console.log(message);
    });
}
function drawPlayers(players, color)
{
    $(players).each(function(index, player) {
        var p = pitch.circle(player.position.x, player.position.y, 6).attr('fill', color);

        var a = new Vector2D(player.position.x - 3, player.position.y + 8);
        var b = new Vector2D(player.position.x + 3, player.position.y + 10);
        var c = new Vector2D(player.position.x + 3, player.position.y - 10);
        var d = new Vector2D(player.position.x - 3, player.position.y - 8);
        var shape = pitch.path('M' + a.x + ',' + a.y + 'L' + b.x + ',' + b.y + 'L' + c.x + ',' + c.y + 'L' + d.x + ',' + d.y + 'L' + a.x + ',' + a.y).attr('fill', color);
        shape.transform('r' + (Raphael.deg(Math.atan2(player.heading.x, -player.heading.y)) - 90));

        if ($('#showIfThreatened').is(':checked') && player.threatened) {
            p.attr('stroke', '#ff0');
            shape.attr('stroke', '#ff0');
        } else {
            p.attr('stroke', color);
            shape.attr('stroke', color);
        }
        var label = [];
        if (player.id) {
            label.push(player.id);
        }
        if ($('#showPlayerState').is(':checked') && player.state) {
            label.push(player.state);
        }
        if (label.length > 0) {
            pitch.text(player.position.x, player.position.y - 15, label.join(' '));
        }
        if ($('#showSteeringForce').is(':checked') && player.steeringForce.x && player.steeringForce.y) {
            pitch.path('M' + player.position.x + ',' + player.position.y + 'L' + player.steeringForce.x + ',' + player.steeringForce.y).attr('stroke', '#ff0');
        }
        if ($('#showTarget').is(':checked') && player.target) {
            pitch.path('M' + player.position.x + ',' + player.position.y + 'L' + player.target.x + ',' + player.target.y).attr('stroke', '#0ff');
        }
    });
}

function Vector2D(x, y) {
    this.x = x;
    this.y = y;
}
