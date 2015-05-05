var pitchWidth = 1050;
var pitchHeight = 680;
var pitchOffsetWidth = 60;
var pitchOffsetHeight = 20;
var pitchCenterX = pitchWidth / 2 + pitchOffsetWidth;
var pitchCenterY = pitchHeight / 2 + pitchOffsetHeight;
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
    $('.js-fps-update').html((data.serverFps).toFixed(1) + ' fps (update cycle)');
    $('.js-fps-render').html((1000 / frameTime).toFixed(1) + ' fps (render cycle)');
}
function drawGras()
{
    pitch.rect(0, 0, pitchWidth + pitchOffsetWidth * 2, pitchHeight + pitchOffsetHeight * 2).attr('fill', '#090').attr('stroke', '#090');
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
    pitch.circle(ball.position.x, ball.position.y, 2.2).attr('fill', '#fff').attr('stroke', '#fff');
}
function drawGoalRed(goalRed)
{
    pitch.rect(goalRed.leftPost.x - 20, goalRed.leftPost.y, 20, goalRed.rightPost.y - goalRed.leftPost.y).attr('stroke', '#fff');
}
function drawGoalBlue(goalBlue)
{
    pitch.rect(goalBlue.leftPost.x, goalBlue.leftPost.y, 20, goalBlue.rightPost.y - goalBlue.leftPost.y).attr('stroke', '#fff');
}
function drawPitchMarkings()
{
    pitch.circle(pitchCenterX, pitchCenterY, 91.5).attr('stroke', '#fff'); // kick off circle
    pitch.circle(pitchCenterX, pitchCenterY, 1).attr('stroke', '#fff'); // kick off spot
    pitch.rect(pitchOffsetWidth, pitchOffsetHeight, pitchWidth, pitchHeight).attr('stroke', '#fff'); // pitch limitations
    pitch.path(['M', pitchCenterX, pitchOffsetHeight, 'L', pitchCenterX, pitchHeight + pitchOffsetHeight]).attr('stroke', '#fff'); // middle line
    pitch.rect(pitchOffsetWidth, pitchCenterY - 201.6, 165, 403.2).attr('stroke', '#fff'); // left penalty area
    pitch.rect(pitchWidth + pitchOffsetWidth - 165, pitchCenterY - 201.6, 165, 403.2).attr('stroke', '#fff'); // right penalty area
    pitch.rect(pitchOffsetWidth, pitchCenterY - 91.6, 55, 183.2).attr('stroke', '#fff'); // left goalkeeper area
    pitch.rect(pitchWidth + pitchOffsetWidth - 55, pitchCenterY - 91.6, 55, 183.2).attr('stroke', '#fff'); // right goalkeeper area
    pitch.circle(pitchOffsetWidth + 110, pitchCenterY, 1).attr('stroke', '#fff'); // left penalty kick spot
    pitch.circle(pitchOffsetWidth + pitchWidth - 110, pitchCenterY, 1).attr('stroke', '#fff'); // right penalty kick spot
}
function drawScore(goalRed, goalBlue)
{
    $('.js-score-red').html(goalBlue.goalsScored);
    $('.js-score-blue').html(goalRed.goalsScored);
}
function drawTeamRed(team)
{
    drawTeamInControl(team.inControl, 'red');
    drawControllingPlayer(team.controllingPlayer, 'red');
    drawSupportSpots(team);
    drawTeamState(team.state, 'red');
    drawTeamDebugMessages(team.debug);
    drawPlayers(team.players, '#f00');
}
function drawTeamBlue(team)
{
    drawTeamInControl(team.inControl, 'blue');
    drawControllingPlayer(team.controllingPlayer, 'blue');
    drawSupportSpots(team);
    drawTeamState(team.state, 'blue');
    drawTeamDebugMessages(team.debug);
    drawPlayers(team.players, '#00f');
}
function drawTeamInControl(inControl, team)
{
    $('.js-in-control-' + team).html('');
    if (inControl) {
        $('.js-in-control-' + team).html('in control');
    }
}
function drawControllingPlayer(player, team)
{
    $('.js-controlling-player-' + team).html('');
    if (player) {
        $('.js-controlling-player-' + team).html(player.id);
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
function drawTeamState(state, team, color)
{
    $('.js-team-state-' + team).html(state);
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
        var p = pitch.circle(player.position.x, player.position.y, 3).attr('fill', color);

        var shape = pitch.path([
            'M', player.position.x - 1.5, player.position.y + 4,
            'L', player.position.x + 1.5, player.position.y + 5,
            'L', player.position.x + 1.5, player.position.y - 5,
            'L', player.position.x - 1.5, player.position.y - 4,
            'L', player.position.x - 1.5, player.position.y + 4
        ]).attr('fill', color);
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
